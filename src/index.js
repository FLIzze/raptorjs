#!/usr/bin/env node

import { Logger } from "../src/logger.js";
import {spawn, exec} from "child_process";
import {fileURLToPath} from "url";
import {argv} from "process";
import fs from "fs";
import fsp from "fs/promises";
import {homedir} from "os";
import path from "path";

const logger = new Logger
const commandsFolderUrl = new URL("./commands/", import.meta.url);
const pwd = process.cwd();
const home = homedir();
const firstArg = argv[2];

class Command {
        /**
         * Initialize the user project by running init.sh script.
         */
        init() {
                const initCommandUrl = new URL("init.sh", commandsFolderUrl);
                const initCommandPath = fileURLToPath(initCommandUrl);
                this.execFile(initCommandPath, [firstArg]);
        }

        /**
         * Pull latest changes in the framework repository.
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
         * Add a model file from templates to project src/models directory.
         * @param {string} modelName - Name of the model file to add (without extension)
         */
        async addModel(modelName) {
                const configFilePath = path.join(pwd, "raptor.conf.json");
                if (!fs.existsSync(configFilePath)) {
                        console.error("Please run this command from the project root directory.");
                        return;
                }

                const source = path.join(home, ".raptorjs", "templates", "db", "model.js");
                const targetDir = path.join(pwd, "src", "models");

                // Ensure target directory exists
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
         * Execute a shell script file with arguments.
         * @param {string} filePath - Path to the shell script
         * @param {string[]} args - Arguments to pass to the script
         */
        execFile(filePath, args = []) {
                const child = spawn("bash", [filePath, ...args], {stdio: "inherit"});

                child.on("error", (err) => {
                        console.error(`Failed to start subprocess: ${err}`);
                });
        }
}

const command = new Command();

// Basic argument check & command dispatch
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
        
        case "test":
                logger.info('test');
                break;

        default:
                console.error("Unknown command:", firstArg);
                process.exit(1);
}

/**
 * Copy a file asynchronously.
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 */
async function copyTo(src, dest) {
        try {
                await fsp.copyFile(src, dest);
                console.log(`Copied file from ${src} to ${dest}`);
        } catch (err) {
                console.error(`Error copying file: ${err.message}`);
        }
}
