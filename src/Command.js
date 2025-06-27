import {exec, spawn} from "child_process";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {fileURLToPath, pathToFileURL} from "url";
import copyTo, {commandsFolderUrl, firstArg, home, pwd} from ".";

// Since index.js (this file), is used as bin in package.json,
// relative imports are relative to bin not this file.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {migrateModels} = await import(pathToFileURL(path.join(__dirname, "db/migrations.js")).href);

export class Command {
        /**
         * Initializes the user project by running init.sh script.
         */
        init() {
                const initCommandUrl = new URL("init.sh", commandsFolderUrl);
                const initCommandPath = fileURLToPath(initCommandUrl);
                this.execFile(initCommandPath, [firstArg]);
        }

        /**
         * Pulls latest changes in the framework repository.
         */
        update() {
                console.log("Updating the repository...");
                exec(`git pull ${path.join(home, ".raptorjs")}`, (error, _, stderr) => {
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
                const configFilePath = path.join(pwd, "raptor.conf.json");
                if (!fs.existsSync(configFilePath)) {
                        console.error("Please run this command from the project root directory.");
                        return;
                }

                const source = path.join(home, ".raptorjs", "templates", "db", "model.js");
                const targetDir = path.join(pwd, "src", "models");

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

        migrate() {
                const configFilePath = path.join(pwd, "raptor.conf.json");
                if (!fs.existsSync(configFilePath)) {
                        console.error("Please run this command from the project root directory.");
                        return;
                }

                migrateModels();
        }
}

