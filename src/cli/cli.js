#!/usr/bin/env node

import {Logger} from "../logs/logger.js";
import {Command} from "./command.js";
import {argv} from "process";
import {homedir} from "os";

export const commandsFolderUrl = new URL("./commands/", import.meta.url);
export const pwd = process.cwd();
export const home = homedir();
export const firstArg = argv[2];

const logger = new Logger();
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
case "test":
        logger.info('test');
        break;
default:
        console.error("Unknown command:", firstArg);
        process.exit(1);
}
