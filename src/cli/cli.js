#!/usr/bin/env node

import {Rollback} from "../db/rollback.js";
import {Command} from "./command.js";
import fs from "fs";
import path, {resolve, dirname} from "path";
import {initFunc} from "./commands/init.js";
import {fileURLToPath} from "url";

const commands = {
        help: {
                description: "Display this help message.",
                handler: () => {
                        console.log("Usage: cli <command> [args]\n");
                        console.log("Available commands:");
                        for (const [name, cmd] of Object.entries(commands)) {
                                console.log(`  ${name.padEnd(15)} - ${cmd.description}`);
                        }
                }
        },
        init: {
                description: "Initialize the project structure.",
                handler: async () => {
                        const filename = fileURLToPath(import.meta.url);
                        const npxpath = resolve(dirname(filename), '..', '..');
                        await initFunc(npxpath);
                }
        },
        addCommand: {
                description: "Add Command",
                handler: () => {
                        checkIfIsInProjectDir();
                        command.addCommand()
                }
        },
        rmCommand: {
                description: "Remove command",
                handler: () => {
                        checkIfIsInProjectDir();
                        command.rmCommand();
                }
        },
        addOpt: {
                description: "Add Option to one command",
                handler: () => {
                        checkIfIsInProjectDir();
                        command.addOpt();
                }
        },
        rmOpt: {
                description: "Remove Option to one command",
                handler: () => {
                        checkIfIsInProjectDir();
                        command.rmOpt();
                }
        },
        addModel: {
                description: "Add a new model. Usage: addModel <name>",
                requiredArgs: 1,
                handler: async ([name]) => {
                        checkIfIsInProjectDir();
                        const command = new Command();
                        await command.addModel(name);
                }
        },
        migrate: {
                description: "Run database migrations.",
                handler: async () => {
                        checkIfIsInProjectDir();
                        const command = new Command();
                        await command.migrate();
                }
        },
        renameModel: {
                description: "Rename a model and its DB table. Usage: renameModel <oldName> <newName>",
                requiredArgs: 2,
                handler: async ([oldName, newName]) => {
                        checkIfIsInProjectDir();
                        const command = new Command();
                        await command.renameModel(oldName, newName);
                }
        },
        deleteModel: {
                description: "Delete a model and its DB table. Usage: deleteModel <name>",
                requiredArgs: 1,
                handler: async ([name]) => {
                        checkIfIsInProjectDir();
                        const command = new Command();
                        await command.deleteModel(name);
                }
        },
        rollback: {
                description: "Rollbacks",
                handler: async () => {
                        checkIfIsInProjectDir();
                        const rollback = new Rollback();
                        rollback.init();
                }
        },
};

/**
 * @typedef {Object} CommandEntry
 * @property {string} description
 * @property {number} [requiredArgs]
 * @property {(args: string[]) => Promise<void> | void} handler
 */

(async function main() {
        const cmd = process.argv[2];
        const args = process.argv.slice(3);

        if (cmd === "--help" || cmd === "-h") {
                commands.help.handler();
                return;
        }

        /** @type {CommandEntry | undefined} */
        const commandEntry = cmd ? commands[cmd] : undefined;

        if (!commandEntry) {
                console.error(`Unknown command: ${cmd}\nUse -h or --help to list available commands.`);
                process.exit(1);
        }

        if (commandEntry.requiredArgs && args.length < commandEntry.requiredArgs) {
                console.error(`Missing arguments for "${cmd}".\nUsage: ${commandEntry.description}`);
                process.exit(1);
        }

        try {
                await commandEntry.handler(args);
        } catch (err) {
                console.error(`Command "${cmd}" failed: ${err.message ?? err}`);
                process.exit(1);
        }
})();

function checkIfIsInProjectDir() {
        const configFilePath = path.join(process.cwd(), "raptor.config.json");
        if (!fs.existsSync(configFilePath)) {
                console.error("Please run this command from the project root directory.");
                process.exit(1);
        }
}
