import fs from "fs";
import path from 'path';
import {fileURLToPath} from 'url';
import {select, confirm} from '@inquirer/prompts';
import {Database} from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} RollbackEntry
 * @property { "deleteModel" | "renameModel" | "addModel" | "migrate" } type
 * @property {any} data
 */

export class Rollback {
        constructor() {
                this.path = path.join(__dirname, "..", ".rollback.backup.json");
                this.buildBackupFile();
                this.db = new Database();
        }

        buildBackupFile() {
                const dir = path.dirname(this.path);
                if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, {recursive: true});
                }

                if (!fs.existsSync(this.path)) {
                        fs.writeFileSync(this.path, "[]");
                }
        }

        /**
         * @param {RollbackEntry} entry
         */
        register(entry) {
                try {
                        const currentEntries = this.read();

                        if (currentEntries.length >= 5) {
                                currentEntries.pop();
                        };

                        currentEntries.unshift(entry);

                        fs.writeFileSync(this.path, JSON.stringify(currentEntries, null, 2));
                } catch (err) {
                        console.error("Error registering to rollback file:", err);
                        return;
                }
        }

        /**
         * @returns {RollbackEntry[]}
         */
        read() {
                try {
                        const data = fs.readFileSync(this.path, 'utf-8');
                        return data ? JSON.parse(data) : [];
                } catch (err) {
                        console.error("Error reading rollback file:", err);
                        return [];
                }
        }

        async init() {
                const rollbackOptions = this.read();

                if (rollbackOptions.length === 0) {
                        console.log("No rollback options available.");
                        return;
                }

                const choices = rollbackOptions.map((entry, index) => ({
                        name: `${index + 1}. [${entry.type}] ${JSON.stringify(entry.data).slice(0, 50)}...`,
                        value: index
                }));

                const selectedIndex = await select({
                        message: "Choose a rollback to apply:",
                        choices
                });

                const confirmed = await confirm({
                        message: `Are you sure you want to rollback: ${choices[selectedIndex].name}?`,
                        initial: false
                });

                if (!confirmed) {
                        console.log("Rollback cancelled.");
                        return;
                }

                const selectedRollback = rollbackOptions[selectedIndex];
                this.handleRollbackType(selectedRollback);
        }

        /**
         * @param {RollbackEntry} rollbackData
         */
        async handleRollbackType(rollbackData) {
                const data = rollbackData.data;
                switch (rollbackData.type) {
                case "deleteModel":
                {
                        const keys = Object.keys(data.table[0]);
                        const values = Object.values(data.table);

                        await this.db.createTable(data.name, keys);

                        values.forEach(async value => {
                                await this.db.insert(data.name, value);
                        });
                        break;
                }
                case "renameModel":
                        this.db.renameTable(data.oldName, data.newName);
                        break;
                case "migrate":
                        rollbackData.data.forEach(modelName => {
                                this.db.dropTable(modelName);
                        });
                        break;
                case "addModel":
                        this.db.dropTable(data.modelName);
                        break;
                default:
                        console.error("Rollback type not recognized");
                        break;
                }
        }
}
