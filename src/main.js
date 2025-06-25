#!/usr/bin/env node

import {exec} from "child_process";
import {fileURLToPath} from "url";

class Command {
        /**
         * Init the project
         */
        init() {
                const initCommandUrl = new URL("init.sh", commandsFolderUrl);
                const initCommandPath = fileURLToPath(initCommandUrl); 
                this.execFile(initCommandPath);
        }

        /**
         * Show help
         */
        help() {
                const helpCommandUrl = new URL("helper.sh", commandsFolderUrl);
                const helpCommandPath = fileURLToPath(helpCommandUrl); 
                this.execFile(helpCommandPath);
        }

        /**
         * Show version
         */
        version() {
                const helpCommandUrl = new URL("helper.sh", commandsFolderUrl);
                const helpCommandPath = fileURLToPath(helpCommandUrl); 
                this.execFile(helpCommandPath, ['-v']);
        }

        /**
         * Execute the (.sh) file with given filePath
         * @param {string} filePath
         * @param {string[]} args - Additional arguments to pass
         */
        execFile(filePath, args = []) {
                const command = `${filePath} ${args.join(' ')}`;
                exec(command, (error, stdout, stderr) => {
                        if (error) {
                                console.error(`Execution error: ${error}`);
                                return;
                        }

                        if (stdout) console.log(stdout);
                        if (stderr) console.error(stderr);
                });
        }
}

const commandsFolderUrl = new URL("./commands/", import.meta.url);
const command = new Command();

// Parse command line arguments
const args = process.argv.slice(2);
const mainCommand = args[0];

switch (mainCommand) {
        case 'init':
                command.init();
                break;
        case 'help':
        case '--help':
        case '-h':
                command.help();
                break;
        case 'version':
        case '--version':
        case '-v':
                command.version();
                break;
        default:
                if (!mainCommand) {
                        command.help();
                } else {
                        console.error(`Commande inconnue: ${mainCommand}`);
                        console.log('Utilisez "raptorjs --help" pour voir l\'aide');
                        process.exit(1);
                }
                break;
}
