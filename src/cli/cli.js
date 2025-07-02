#!/usr/bin/env node

import {Rollback} from "../db/rollback.js";
import {Logger} from "../logs/logger.js";
import {Command} from "./command.js";
import {argv, exit} from "process";
import fs from "fs";
import path from "path";

const command = new Command();
const rollback = new Rollback();

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
                handler: () => command.init()
        },
        addModel: {
                description: "Add a new model. Usage: addModel <name>",
                requiredArgs: 1,
                handler: async ([name]) => {
                        checkIfIsInProjectDir();
                        await command.addModel(name);
                }
        },
        migrate: {
                description: "Run database migrations.",
                handler: async () => {
                        checkIfIsInProjectDir();
                        await command.migrate();
                }
        },
        renameModel: {
                description: "Rename a model and its DB table. Usage: renameModel <oldName> <newName>",
                requiredArgs: 2,
                handler: async ([oldName, newName]) => {
                        checkIfIsInProjectDir();
                        await command.renameModel(oldName, newName);
                }
        },
        deleteModel: {
                description: "Delete a model and its DB table. Usage: deleteModel <name>",
                requiredArgs: 1,
                handler: async ([name]) => {
                        checkIfIsInProjectDir();
                        await command.deleteModel(name);
                }
        },
        rollback: {
                description: "Rollbacks",
                handler: async () => {
                        checkIfIsInProjectDir();
                        rollback.init();  
                }
        },
};

(async function main() {
        const [, , cmd, ...args] = argv;

        if (cmd === "--help" || cmd === "-h") {
                commands.help.handler();
                return;
        }

        const commandEntry = commands[cmd];

        if (!commandEntry) {
                console.error(`Unknown command: ${cmd}\nUse -h or --help to list available commands.`);
                exit(1);
        }

        if (commandEntry.requiredArgs && args.length < commandEntry.requiredArgs) {
                console.error(`Missing arguments for "${cmd}".\nUsage: ${commandEntry.description}`);
                exit(1);
        }

        try {
                await commandEntry.handler(args);
        } catch (err) {
                const logger = new Logger();
                logger.error(`Command "${cmd}" failed: ${err.message}`);
                exit(1);
        }
})();

function checkIfIsInProjectDir() {
        const configFilePath = path.join(process.cwd(), "raptor.config.json");
        if (!fs.existsSync(configFilePath)) {
                console.error("Please run this command from the project root directory.");
                exit(1);
        }

}
