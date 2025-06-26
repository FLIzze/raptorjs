#!/usr/bin/env node

import {spawn} from "child_process";
import {fileURLToPath} from "url";
import {argv} from "process";

const commandsFolderUrl = new URL("./commands/", import.meta.url);

const firstArg = process.argv[2]

class Command {
        /**
         * Init the project in the $HOME/Documents directory 
         */
        init() {
                const initCommandUrl = new URL("init.sh", commandsFolderUrl);
                const initCommandPath = fileURLToPath(initCommandUrl);
                this.execFile(initCommandPath, [firstArg]);
        }

        /**
         * Add a model that would be later migrated in sqlite
         * argv[3] is modelName, argv[2] is function call
         * @param {string} modelName
         */
        addModel(modelName) {
                const loc = window.location.pathname;
                console.log(loc);
                // copyTo(src, modelName);
        }

        /**
         * Execute the (.sh) file with given filePath
         * @param {string} filePath
         * @param {string[]} args
         */
        execFile(filePath, args = []) {
                const child = spawn("bash", [filePath, ...args], {
                        stdio: "inherit"
                });

                child.on("error", (err) => {
                        console.error(`Failed to start subprocess: ${err}`);
                });

                // child.on("exit", (code) => {
                //         console.log(`Process exited with code ${code}`);
                // });
        }
}

const command = new Command();

// TODO - args check
switch (argv[2]) {
        case "init":
                command.init();
                break;
        case "addModel":
                command.addModel(argv[3]);
                break;
        default:
                console.error("Unknown command: ", firstArg);
}

/**
 * @param {string} src
 * @param {string} dest
 */
async function copyTo(src, dest) {
        try {
                await copyFile(src, dest);
        } catch (err) {
                console.error(err);
        }
}
