import {spawn} from "child_process";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {homedir} from "os";
import {Database} from "../db/database.js";
import {dirname} from "path";
import {fileURLToPath, pathToFileURL} from "url";
import {Rollback} from "../db/rollback.js";
import {Logger} from "../logs/logger.js";
import {copyFile} from "../utils/file.js";
import { initFunc } from "./commands/init.js";

export class Command {
        constructor() {
                this.commandsFolderUrl = new URL("./commands/", import.meta.url);
                this.pwd = process.cwd();
                this.home = homedir();
                this.filename = fileURLToPath(import.meta.url);
                this.dirname = dirname(this.filename);

                this.db = new Database();
                this.rollback = new Rollback();
                this.logger = new Logger();
        }

        async init() {
                await initFunc(this.npxpath);
        }

        /**
         * @param {string} modelName      
         */
        async addModel(modelName) {
                this.register("addModel", {modelName: modelName}, `Added ${modelName}`);

                const source = path.join(this.home, ".raptorjs", "templates", "db", "model.js");
                const targetDir = path.join(this.pwd, "src", "models");

                try {
                        await fsp.mkdir(targetDir, {recursive: true});
                } catch (err) {
                        this.logger.error(`Error creating models directory: ${err.message}`);
                        return;
                }

                const target = path.join(targetDir, `${modelName}.js`);

                await copyFile(source, target);
                this.logger.info(`Model successfully added as ${target}`);
        }

        execFile(filePath, args = []) {
                const child = spawn("bash", [filePath, ...args], {stdio: "inherit"});

                child.on("error", (err) => {
                        this.logger.error(`Failed to start subprocess: ${err}`);
                });
        }

        /**
         * @param {string} oldName      
         * @param {string} newName
         */
        async renameModel(oldName, newName) {
                this.register("renameModel", {oldName: oldName, newName: newName}, `Renamed ${oldName} to ${newName}`);

                const oldPath = path.join(this.pwd, "src", "models", `${oldName}.js`);
                const newPath = path.join(this.pwd, "src", "models", `${newName}.js`);

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
                        this.logger.info(`Model file renamed to "${newName}.js"`);
                } catch (err) {
                        this.logger.error(`Failed to rename model file: ${err.message}`);
                        return;
                }

                await this.db.renameTable(oldName, newName);
        }

        /**
         * @param {string} name
         */
        async deleteModel(name) {
                const model = await this.db.find(name);
                const keys = model.keys();
                const values = model.values();

                this.register("deleteModel", {name: name, keys: keys, values: values}, `Deleted model ${name} with ${model.length} rows`);

                const modelPath = path.join(this.pwd, "src", "models", `${name}.js`);
                if (!fs.existsSync(modelPath)) {
                        this.logger.error(`Model "${name}" does not exist.`);
                        return;
                }

                try {
                        await fsp.unlink(modelPath);
                        this.logger.info(`Deleted model file "${name}.js"`);
                } catch (err) {
                        this.logger.error(`Failed to delete model file: ${err.message}`);
                        return;
                }

                await this.db.dropTable(name);
        }

        async migrate() {
                const modelDir = path.join(process.cwd(), "src/models");
                const files = fs.readdirSync(modelDir).filter(file => file.endsWith(".js"));

                this.logger.info("Starting migration...");
                this.register("migration", files, `Migrated ${files}`);

                for (const file of files) {
                        try {
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

                                this.db.createTable(file.split(".")[0], columns);
                        } catch (err) {
                                this.logger.error(`Migration failed for ${file}: ${err}`);
                        }
                }

                this.logger.info("Migration completed.");
        }

        /**
         * @param {string} type
         * @param {any} data
         * @param {string} recoveryMessage
         */
        register(type, data, recoveryMessage) {
                const register = {
                        type: type,
                        data: data,
                        recoveryMessage: recoveryMessage,
                };

                this.rollback.register(register);
                this.logger.info(`Backup ${type}`);
        }
}
