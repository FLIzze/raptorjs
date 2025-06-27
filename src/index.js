#!/usr/bin/env node

import {spawn, exec} from "child_process";
import {fileURLToPath} from "url";
import {argv} from "process";

const commandsFolderUrl = new URL("./commands/", import.meta.url);
const pwd = process.cwd();
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
         * Update the project in the $HOME/Documents directory 
         */
        update() {
                console.log("Updating the repository...");
                exec('git pull', (error, _, stderr) => {
                        if (error) {
                                console.error(`Error updating the repository: ${error.message}`);
                                return;
                        }
                        if (stderr) {
                                console.error(`stderr updating the repository: ${stderr}`);
                                return;
                        }
                        console.log("Succesfully updated the repository !");
                });
        }

        /**
         * Add a model that would be later migrated in sqlite
         * argv[3] is modelName, argv[2] is function call
         * @param {string} modelName
         */
        addModel(modelName) {
                const filePath = path.join(pwd, "raptor.conf.json");

                if (!fs.existsSync(filePath)) {
                        console.error(`No 'raptor.conf.json' in current directory, 
                        please use commands in projet root.`);

                        return;
                }
                copyTo(src, modelName);
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
        case "update":
                command.update();
                break;
        default:
                console.error("Unknown command: ", firstArg);
                break;
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
