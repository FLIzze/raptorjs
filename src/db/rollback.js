import fs from "fs";
import path from 'path';
import {fileURLToPath} from 'url';
import {select, confirm} from '@inquirer/prompts';
import {Database} from "./database.js";
import {writeFile, removeFile, renameFile} from "../utils/file.js";
import { ExitPromptError } from '@inquirer/core'; 
import {Logger} from "../logs/logger.js";

/**
 * @typedef {Object} DeleteModelData
 * @property {string} name
 * @property {Array<string>} keysName
 * @property {Array<string>} keysType
 * @property {Array<string>} values
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
 * @property {"migration"} type
 * @property {string[]} data
 * @property {string} recoveryMessage
 */

/**
 * @typedef {RollbackEntry | RenameRollbackEntry | AddRollbackEntry | MigrateRollbackEntry} AnyRollbackEntry
 */

export class Rollback {
        constructor() {
                /** @type {string} */    
                this.path = path.join(process.cwd(), ".rollback.backup.json");
                this.conf = path.join(process.cwd(), "raptor.config.json");

                this.buildBackupFile();

                /** @type {Database} */    
                this.db = new Database();

                /** @type {Logger} */    
                this.logger = new Logger();

                this.rollbackNbr = 5;
                try {
                        if (fs.existsSync(this.conf)) {
                                const confData = fs.readFileSync(this.conf, 'utf-8');
                                const confJson = JSON.parse(confData);
                                if (typeof confJson.rollbackNbr === 'number' && confJson.rollbackNbr > 0) {
                                        this.rollbackNbr = confJson.rollbackNbr;
                                }
                        }
                } catch (err) {
                        console.error("Failed to read config rollbackNbr, using default 5:", err);
                }
        }

        buildBackupFile() {
                const dir = path.dirname(this.path);

                if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, {recursive: true});
                }

                if (!fs.existsSync(this.path) || fs.statSync(this.path).isDirectory()) {
                        fs.writeFileSync(this.path, "[]", {encoding: "utf-8"});
                }
        }

        /**
         * @param {RollbackEntry} entry
         */
        register(entry) {
                try {
                        const currentEntries = this.read();
                        if (currentEntries.length >= this.rollbackNbr) {
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
                try {
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

                        let selectedIndex;
                        try {
                                selectedIndex = await select({
                                        message: "Choose a rollback to apply:",
                                        choices
                                });
                        } catch (err) {
                                if (err instanceof ExitPromptError) {
                                        return; 
                                }
                                throw err; 
                        }

                        let confirmed;
                        try {
                                confirmed = await confirm({
                                        message: `Are you sure you want to rollback: ${choices[selectedIndex].name}?`,
                                });
                        } catch (err) {
                                if (err instanceof ExitPromptError) {
                                        return; 
                                }
                                throw err;
                        }

                        if (!confirmed) {
                                console.log("Rollback cancelled.");
                                return;
                        }

                        const selectedRollback = rollbackOptions[selectedIndex];

                        try {
                                await this.handleRollbackType(selectedRollback);
                                await this.removeRollbackFromHistory(rollbackOptions, selectedIndex); 
                        } catch (err) {
                                console.error("Rollback failed:", err);
                        }

                } catch (error) {
                        console.error("An unexpected error occurred:", error);
                }
        }

        /**
         * @param {RollbackEntry[]} rollbackEntries
         * @param {number} index
         */
        async removeRollbackFromHistory(rollbackEntries, index) {
                try {
                        rollbackEntries.splice(index, 1);

                        await writeFile(this.path, this.logger, JSON.stringify(rollbackEntries, null, 2));

                        this.logger.info("Rollback history updated.");
                } catch (err) {
                        this.logger.error(`Failed to remove rollback from history: ${err}`);
                }
        }

        /**
         * @param {AnyRollbackEntry} rollbackData
         */
        async handleRollbackType(rollbackData) {
                const pwd = process.cwd();
                const modelsFolder = fileURLToPath(new URL(`${pwd}/src/models`, import.meta.url));

                /** @type {"js" | "ts"} */
                const extensionConfig = fs.existsSync(path.join(process.cwd(), "tsconfig.json")) ? "ts" : "js";

                switch (rollbackData.type) {
                case "deleteModel": {
                        /** @type {DeleteModelData} */
                        const data = rollbackData.data;

                        if (!data.values || data.values.length === 0) {
                                this.logger.error(`No data found in table ${data.name}, use 'deleteModel if you wish to delete it`);
                        }

                        const columns = data.keysName.map((key, index) => `${key} ${data.keysType[index]}`);
                        const columnsDef = columns.join(", ");

                        await this.db.createTable(data.name, columnsDef);

                        const modelFields = data.keysName
                                .map((key, index) => `    ${key}: "${data.keysType[index]}"`)
                                .join(",\n");

                        const modelContent = `// file name is table name\n\nexport const fields = {\n${modelFields}\n};\n`;

                        const modelPath = path.join(modelsFolder, `${data.name}.${extensionConfig}`);
                        await writeFile(modelPath, this.logger, modelContent);

                        if (!Array.isArray(data.values)) {
                                return;
                        }

                        for (const rowValues of data.values) {
                                const rowObject = {};
                                data.keysName.forEach((key, index) => {
                                        rowObject[key] = rowValues[index];
                                });

                                await this.db.insert(data.name, rowObject);
                        }

                        break;
                }
                case "renameModel":
                {
                        /** @type {RenameModelData} */
                        const data = rollbackData.data;

                        this.db.renameTable(data.oldName, data.newName);
                        await renameFile(`${modelsFolder}/${data.oldName}.${extensionConfig}`, `${modelsFolder}/${data.newName}.${extensionConfig}`, this.logger);
                        break;
                }
                case "migration":
                {
                        const data = rollbackData.data;

                        data.forEach(modelName => {
                                this.db.dropTable(`${modelName}`);
                        });
                        break;
                }
                case "addModel":
                {
                        /** @type {AddModelData} */
                        const data = rollbackData.data;

                        this.db.dropTable(data.modelName);
                        await removeFile(`${modelsFolder}/${data.modelName}.${extensionConfig}`, this.logger);
                        break;
                }
                default:
                        console.error("Rollback type not recognized");
                        break;
                }
        }
}
