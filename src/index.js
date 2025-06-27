#!/usr/bin/env node

import {spawn, exec} from "child_process";
import {fileURLToPath} from "url";
import {argv} from "process";
import fs from "fs";
import fsp from "fs/promises";
import {homedir} from "os";
import path from "path";
// IMPORT IS RELATIVE TO BIN
import {migrateModels} from "./db/migrations";

const commandsFolderUrl = new URL("./commands/", import.meta.url);
const pwd = process.cwd();
const home = homedir();
const firstArg = argv[2];

class Command {
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

const command = new Command();

switch (firstArg) {
        case "init":
                command.init();
                break;
        case "addModel":
                if (!argv[3]) {
                        console.error("Please provide a model name.");
                        process.exit(1);
                }
                await command.addModel(argv[3]);
                break;
        case "update":
                command.update();
                break;
        case "migrate":
                command.migrate();
                break;
        default:
                console.error("Unknown command:", firstArg);
                process.exit(1);
}

/**
 * Copy a file asynchronously.
 * @param {string} src 
 * @param {string} dest 
 */
async function copyTo(src, dest) {
        try {
                await fsp.copyFile(src, dest);
                console.log(`Copied file from ${src} to ${dest}`);
        } catch (err) {
                console.error(`Error copying file: ${err.message}`);
        }
}
