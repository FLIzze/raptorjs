import {exec, spawn} from "child_process";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {fileURLToPath} from "url";
import {copyTo} from "../utils/copyTo.js";
import {homedir} from "os";
import {Database} from "../db/database.js";

export class Command {
        constructor() {
                this.commandsFolderUrl = new URL("./commands/", import.meta.url);
                this.pwd = process.cwd();
                this.home = homedir();
        }

        init() {
                const initCommandUrl = new URL("init.sh", this.commandsFolderUrl);
                const initCommandPath = fileURLToPath(initCommandUrl);
                this.execFile(initCommandPath);
        }

        /**
         * TODO - change 
         */
        update() {
                console.log("Updating the repository...");
                exec(`git pull ${path.join(this.home, ".raptorjs")}`, (error, _, stderr) => {
                        if (error) {
                                console.error(`Error updating the repository: ${error.message}`);
                                return;
                        }
                        if (stderr) {
                                console.error(`stderr updating the repository: ${stderr}`);
                                return;
                        }
                        console.log("Successfully updated the repository!");
                });
        }

        /**
         * Adds a model file from templates to project src/models directory.
         * @param {string} modelName
         */
        async addModel(modelName) {
                const configFilePath = path.join(this.pwd, "raptor.conf.json");
                if (!fs.existsSync(configFilePath)) {
                        console.error("Please run this command from the project root directory.");
                        return;
                }

                const source = path.join(this.home, ".raptorjs", "templates", "db", "model.js");
                const targetDir = path.join(this.pwd, "src", "models");

                try {
                        await fsp.mkdir(targetDir, {recursive: true});
                } catch (err) {
                        console.error(`Error creating models directory: ${err.message}`);
                        return;
                }

                const target = path.join(targetDir, `${modelName}.js`);

                await copyTo(source, target);
                console.log(`Model successfully added as ${target}`);
        }

        /**
         * Executes a shell script file with arguments.
         * @param {string} filePath
         * @param {string[]} args
         */
        execFile(filePath, args = []) {
                const child = spawn("bash", [filePath, ...args], {stdio: "inherit"});

                child.on("error", (err) => {
                        console.error(`Failed to start subprocess: ${err}`);
                });
        }


        /**
         * Renames model file name (which is used as table name)
         * @param {string} oldName
         * @param {string} newName
         */
        async renameModel(oldName, newName) {
                const configFilePath = path.join(this.pwd, "raptor.conf.json");
                if (!fs.existsSync(configFilePath)) {
                        console.error("Please run this command from the project root directory.");
                        return;
                }

                const oldPath = path.join(this.pwd, "src", "models", `${oldName}.js`);
                const newPath = path.join(this.pwd, "src", "models", `${newName}.js`);

                if (!fs.existsSync(oldPath)) {
                        console.error(`Model "${oldName}" does not exist.`);
                        return;
                }

                try {
                        await fsp.rename(oldPath, newPath);
                        console.log(`Model file renamed to "${newName}.js"`);
                } catch (err) {
                        console.error(`Failed to rename model file: ${err.message}`);
                        return;
                }

                const db = new Database();
                await db.renameTable(oldName, newName);
        }

        /**
         * Deletes the model base on its filename.
         * @param {string} name
         */
        async deleteModel(name) {
                const modelPath = path.join(this.pwd, "src", "models", `${name}.js`);
                if (!fs.existsSync(modelPath)) {
                        console.error(`Model "${name}" does not exist.`);
                        return;
                }

                try {
                        await fsp.unlink(modelPath);
                        console.log(`Deleted model file "${name}.js"`);
                } catch (err) {
                        console.error(`Failed to delete model file: ${err.message}`);
                        return;
                }

                const db = new Database();
                await db.dropTable(name);
        }
}

