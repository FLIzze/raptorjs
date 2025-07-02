import fs from "fs";
import path from 'path';
import {fileURLToPath} from 'url';
import {select, confirm} from '@inquirer/prompts';
import {Database} from "./database.js";
import {addFile, removeFile, renameFile} from "../utils/file.js";

/**
 * @typedef {Object} DeleteModelData
 * @property {string} name
 * @property {Record<string, string>} keys
 * @property {Array<Object>} values
 */

/**
 * @typedef {Object} RenameModelData
 * @property {string} oldName
 * @property {string} newName
 */

/**
 * @typedef {Object} AddModelData
 * @property {string} modelName
 */

/**
 * @typedef {Object} RollbackEntry
 * @property {"deleteModel"} type
 * @property {DeleteModelData} data
 * @property {string} recoveryMessage
 */

/**
 * @typedef {Object} RenameRollbackEntry
 * @property {"renameModel"} type
 * @property {RenameModelData} data
 * @property {string} recoveryMessage
 */

/**
 * @typedef {Object} AddRollbackEntry
 * @property {"addModel"} type
 * @property {AddModelData} data
 * @property {string} recoveryMessage
 */

/**
 * @typedef {Object} MigrateRollbackEntry
 * @property {"migrate"} type
 * @property {string[]} data
 * @property {string} recoveryMessage
 */

/**
 * @typedef {RollbackEntry | RenameRollbackEntry | AddRollbackEntry | MigrateRollbackEntry} AnyRollbackEntry
 */

export class Rollback {
        constructor() {
                this.path = path.join(process.cwd(), ".rollback.backup.json");
                this.buildBackupFile();
                this.db = new Database();
        }

        buildBackupFile() {
                const dir = path.dirname(this.path);

                if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                }

                if (!fs.existsSync(this.path) || fs.statSync(this.path).isDirectory()) {
                        fs.writeFileSync(this.path, "[]", { encoding: "utf-8" });
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

                const maxTypeLength = Math.max(...rollbackOptions.map(entry => entry.type.length));

                const choices = rollbackOptions.map((entry, index) => {
                        const paddedType = entry.type.padEnd(maxTypeLength, ' ');
                        return {
                                name: `${index + 1}. ${paddedType} | ${entry.recoveryMessage}`,
                                value: index
                        };
                });

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
                const pwd = process.cwd();
                const modelsFolder = fileURLToPath(new URL(`${pwd}/src/models`, import.meta.url));

                switch (rollbackData.type) {
                case "deleteModel":
                {
                        /** @type {DeleteModelData} */
                        const data = rollbackData.data;                       

                        await this.db.createTable(data.name, data.keys);
                        await addFile(`${modelsFolder}/${data.name}.js`);

                        if (data.values.length === undefined) {
                                return;
                        }

                        data.values.forEach(async value => {
                                await this.db.insert(data.name, value);
                        });
                        break;
                }
                case "renameModel":
                {
                        /** @type {RenameModelData} */
                        const data = rollbackData.data;                       

                        this.db.renameTable(data.oldName, data.newName);
                        await renameFile(`${modelsFolder}/${data.oldName}.js`, `${modelsFolder}/${data.newName}.js`);
                        break;
                }
                case "migrate":
                {
                        /** @type {MigrateRollbackEntry} */
                        const data = rollbackData.data;                       

                        data.forEach(modelName => {
                                this.db.dropTable(`${modelName}.js`);
                        });
                        break;
                }
                case "addModel":
                {
                        /** @type {AddModelData} */
                        const data = rollbackData.data;                       

                        this.db.dropTable(data.modelName);
                        await removeFile(`${modelsFolder}/${data.modelName}.js`);
                        break;
                }
                default:
                        console.error("Rollback type not recognized");
                        break;
                }
        }
}
