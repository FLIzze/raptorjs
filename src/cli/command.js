import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {Database} from "../db/database.js";
import {dirname, resolve} from "path";
import {fileURLToPath, pathToFileURL} from "url";
import {Rollback} from "../db/rollback.js";
import {Logger} from "../logs/logger.js";
import {copyFile} from "../utils/file.js";
import {addCommandFunc} from "./commands/addCommand.js";
import {rmCommandFunc} from "./commands/rmCommand.js";
import {addCommandOptFunc} from "./commands/addOpt.js";
import {rmOptFunc} from "./commands/rmOpt.js";

// TODO - Add transactions for addModel and deleteModel

export class Command {
        constructor() {
                /** @type {URL} */
                this.commandsFolderUrl = new URL("./commands/", import.meta.url);

                /** @type {string} */
                this.pwd = process.cwd();

                /** @type {string} */
                this.filename = fileURLToPath(import.meta.url);

                /** @type {string} */
                this.dirname = dirname(this.filename);

                /** @type {string} */
                this.npxpath = resolve(this.dirname, '..', '..');

                /** @type {Database} */
                this.db = new Database();

                /** @type {Rollback} */
                this.rollback = new Rollback();

                /** @type {Logger} */ this.logger = new Logger();

                /** @type {"js" | "ts"} */
                this.extension = fs.existsSync(path.join(process.cwd(), "tsconfig.json")) ? "ts" : "js";
        }

        async addCommand() {
                await addCommandFunc();
        }

        async rmCommand() {
                await rmCommandFunc();
        }

        async addOpt() {
                await addCommandOptFunc();
        }

        async rmOpt() {
                await rmOptFunc();
        }

        /**
         * @param {string} modelName      
         */
        async addModel(modelName) {
                this.register("addModel", {modelName}, `Added ${modelName}`);

                const source = path.join(this.npxpath, "templates", "db", "model");
                const targetDir = path.join(this.pwd, "src", "models");

                try {
                        await fsp.mkdir(targetDir, {recursive: true});
                } catch (err) {
                        this.logger.error(`Error creating models directory: ${err.message}`);
                        return;
                }

                const target = path.join(targetDir, `${modelName}.${this.extension}`);

                await copyFile(source, target, this.logger);
                this.logger.info(`Model successfully added as ${target}`);
        }

        /**
         * @param {string} oldName      
         * @param {string} newName
         */
        async renameModel(oldName, newName) {
                this.register("renameModel", {oldName, newName}, `Renamed ${oldName} to ${newName}`);

                const oldPath = path.join(this.pwd, "src", "models", `${oldName}.${this.extension}`);
                const newPath = path.join(this.pwd, "src", "models", `${newName}.${this.extension}`);

                if (!fs.existsSync(oldPath)) {
                        this.logger.error(`Model "${oldName}" does not exist.`);
                        return;
                }

                if (fs.existsSync(newPath)) {
                        this.logger.error(`Model "${newName}" already exists. Choose a different name.`);
                        return;
                }

                try {
                        await fsp.rename(oldPath, newPath);
                        this.logger.info(`Model file renamed to "${newName}.${this.extension}"`);
                } catch (err) {
                        this.logger.error(`Failed to rename model file: ${err.message}`);
                        return;
                }

                try {
                        this.db.run("BEGIN TRANSACTION");
                        this.db.renameTable(oldName, newName);
                        this.db.run("COMMIT");
                } catch (err) {
                        this.logger.error(`Failed to rename database table: ${err.message}`);

                        try {
                                await fsp.rename(newPath, oldPath);
                                this.logger.info(`Reverted file rename due to DB rename failure.`);
                        } catch (rollbackErr) {
                                this.logger.error(`Failed to revert file rename: ${rollbackErr.message}`);
                        }

                        this.db.run("ROLLBACK");
                        return;
                }
        }

        /**
         * @param {string} name
         */
        async deleteModel(name) {
                const model = await this.db.find(name);

                if (!Array.isArray(model) || model.length === 0) {
                        this.logger.warn(`No data found in model "${name}"`);
                        return;
                }

                /**
                 * @type {Array<{
                 *   cid: number,
                 *   name: string,
                 *   type: string,
                 *   notnull: number,
                 *   dflt_value: string | null,
                 *   pk: number
                 * }>}
                 */
                const schemaRows = await this.db.all(`PRAGMA table_info(${name})`);

                const keysType = schemaRows.map(row => row.type);
                const keysName = schemaRows.map(row => row.name);
                const values = model.map(mod => Object.values(mod));

                this.register("deleteModel", {name, keysName, values, keysType}, `Deleted model ${name} with ${model.length} rows`);

                const modelPath = path.join(this.pwd, "src", "models", `${name}.${this.extension}`);
                if (!fs.existsSync(modelPath)) {
                        this.logger.error(`Model "${name}" does not exist.`);
                        return;
                }

                try {
                        await fsp.unlink(modelPath);
                        this.logger.info(`Deleted model file "${name}"`);
                } catch (err) {
                        this.logger.error(`Failed to delete model file: ${err.message}`);
                        return;
                }

                await this.db.dropTable(name);
        }

        async migrate() {
                const modelDir = path.join(process.cwd(), "src/models");
                const files = fs.readdirSync(modelDir);

                this.logger.info("Starting migration...");

                const migratedFiles = [];

                for (const file of files) {
                        try {
                                const tables = await this.db.getTable();

                                const filenameWithoutExt = path.parse(file).name;
                                const tableExists = tables.some(table => table.name === filenameWithoutExt);

                                if (tableExists) {
                                        continue;
                                }

                                const modelPath = pathToFileURL(path.join(modelDir, file)).href;
                                const mod = await import(modelPath);
                                const fields = mod.fields || mod.default?.fields;

                                if (!fields) {
                                        this.logger.warn(`Skipping ${file}: No 'fields' export found`);
                                        continue;
                                }

                                const columns = Object.entries(fields)
                                        .map(([name, type]) => `${name} ${type}`)
                                        .join(", ");

                                await this.db.createTable(filenameWithoutExt, columns);

                                migratedFiles.push(filenameWithoutExt);

                        } catch (err) {
                                this.logger.error(`Migration failed for ${file}: ${err}`);
                        }
                }

                if (migratedFiles.length > 0) {
                        this.register("migration", migratedFiles, `Migrated ${migratedFiles.join(", ")}`);
                } else {
                        this.logger.info("No new migrations needed.");
                }

                this.logger.info("Migration completed.");
        }

        /**
         * @param {"deleteModel" | "renameModel" | "addModel" | "migration"} type
         * @param {any} data
         * @param {string} recoveryMessage
         */
        register(type, data, recoveryMessage) {
                /**
                 * @type {Object} RollbackEntry
                 * @property {"deleteModel"} type
                 * @property {DeleteModelData} data
                 * @property {string} recoveryMessage
                 */
                const register = {
                        type,
                        data,
                        recoveryMessage,
                };

                this.rollback.register(register);
                this.logger.info(`Backup ${type}`);
        }
}
