import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { Database } from "../db/database.js";
import { dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Rollback } from "../db/rollback.js";
import { Logger } from "../logs/logger.js";
import { copyFile, readFile } from "../utils/file.js";
import {ReadmeManager} from "../utils/readme.js";

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

                /** @type {Logger} */
                this.logger = new Logger();
          
                /** @type {ReadmeManager} */
                this.readmeManager = new ReadmeManager();
        }

                /** @type {Logger} */ this.logger = new Logger();

                /** @type {"js" | "ts"} */
                this.extension = fs.existsSync(path.join(process.cwd(), "tsconfig.json")) ? "ts" : "js";
        }

        /**
         * @param {string} modelName      
         */
        async addModel(modelName) {
                await this.register("addModel", {modelName: modelName}, `Added model ${modelName}`);

                const source = path.join(this.npxpath, "templates", "db", "model");
                const targetDir = path.join(this.pwd, "src", "models");

                try {
                        await fsp.mkdir(targetDir, { recursive: true });
                } catch (err) {
                        this.logger.error(`Error creating models directory: ${err.message}`);
                        return;
                }

                const target = path.join(targetDir, `${modelName}.${this.extension}`);

                await copyFile(source, target);
                this.logger.info(`Model successfully added as ${target}`);
        }

        /**
         * @param {string} oldName      
         * @param {string} newName
         */
        async renameModel(oldName, newName) {
                await this.register("renameModel", {oldName: oldName, newName: newName}, `Renamed model ${oldName} to ${newName}`);

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

                await this.db.renameTable(oldName, newName);
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

                await this.register("deleteModel", { name, keysName, values, keysType }, `Deleted model ${name} with ${model.length} rows`);

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
                
                if (!fs.existsSync(modelDir)) {
                        this.logger.warn("No models directory found, skipping migration");
                        return;
                }
                
                const files = fs.readdirSync(modelDir).filter(file => file.endsWith(".js"));

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
                        await this.register("migrate", migratedFiles, `Migrated ${migratedFiles.join(", ")}`);
                } else {
                        this.logger.info("No new migrations needed.");
                }

                this.logger.info("Migration completed.");
        }

        /**     
         * Regenerate the project README completely
         */
        async generateReadme() {
                try {
                        await this.readmeManager.regenerateReadme();
                        this.logger.success("README regenerated successfully");
                } catch (err) {
                        this.logger.error(`Error regenerating README: ${err.message}`);
                }
        }

        * @param {"deleteModel" | "renameModel" | "addModel" | "migration"} type

        /**
         * @param {string} type
         * @param {any} data
         * @param {string} recoveryMessage
         */
        async register(type, data, recoveryMessage) {
                const register = {
                        type,
                        data,
                        recoveryMessage,
                };

                // Register for rollback (existing system)
                this.rollback.register(register);
                this.logger.info(`Backup ${type}`);

                // Add to README history and update
                try {
                        await this.readmeManager.addToHistory(type, recoveryMessage, data);
                        await this.readmeManager.updateReadme();
                        this.logger.info(`README updated automatically`);
                } catch (err) {
                        this.logger.error(`Error updating README: ${err.message}`);
                }
        }

        /**
         * @param {string} commandName      
         */
        async addCommand(commandName) {
                await this.register("addCommand", {commandName: commandName}, `Added Discord command ${commandName}`);

                // Determine if project uses TypeScript
                const configPath = path.join(this.pwd, "raptor.config.json");
                let isTs = false;
                
                try {
                        if (fs.existsSync(configPath)) {
                                const config = JSON.parse(await fsp.readFile(configPath, 'utf-8'));
                                isTs = config.ts === true;
                        }
                } catch (err) {
                        this.logger.warn("Could not read config, defaulting to JavaScript");
                }

                const extension = isTs ? 'ts' : 'js';
                const templatePath = path.join(this.home, ".raptorjs", "templates", "init", isTs ? "TSbun" : "JSbun", `ping.${extension}`);
                const targetDir = path.join(this.pwd, "src", "commands");
                
                try {
                        await fsp.mkdir(targetDir, {recursive: true});
                } catch (err) {
                        this.logger.error(`Error creating commands directory: ${err.message}`);
                        return;
                }

                const target = path.join(targetDir, `${commandName}.${extension}`);

                if (fs.existsSync(target)) {
                        this.logger.error(`Command "${commandName}" already exists.`);
                        return;
                }

                // Create command file from template
                try {
                        let templateContent = await fsp.readFile(templatePath, 'utf-8');
                        
                        // Replace template content with actual command data
                        const commandTemplate = templateContent
                                .replace(/PingCommand/g, `${commandName.charAt(0).toUpperCase() + commandName.slice(1)}Command`)
                                .replace(/name:\s*"ping"/g, `name: "${commandName}"`)
                                .replace(/description:\s*"reply : Pong!"/g, `description: "Description for ${commandName} command"`)
                                .replace(/await interaction\.reply\('Pong!'\)/g, `await interaction.reply('Hello from ${commandName}!')`)
                                .replace(/The ping command was used/g, `The ${commandName} command was used`);
                        
                        await fsp.writeFile(target, commandTemplate);
                        this.logger.info(`Command successfully added as ${target}`);
                } catch (err) {
                        this.logger.error(`Error creating command file: ${err.message}`);
                }
        }
}
