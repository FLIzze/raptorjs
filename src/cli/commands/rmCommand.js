import { ExitPromptError } from "@inquirer/core";
import {exit} from "process";
import path from 'path';
import { readFile,readdir } from "fs/promises";
import { confirm, select } from "@inquirer/prompts";
import { removeFile } from "../../utils/file.js";
import {Logger} from "../../logs/logger.js";

/**
 * Asynchronously handles the removal of a command file from the RaptorJS project.
 *
 * This function lists available command files (excluding the handler file) in the `src/commands/` directory,
 * prompts the user to select one for deletion, confirms the action, and deletes the selected file if confirmed.
 * It reads the project configuration to determine the file extension (TypeScript or JavaScript).
 *
 * @async
 * @function rmCommandFunc
 * @returns {Promise<void>} Resolves when the command removal process is complete.
 *
 * @throws {ExitPromptError} If the user exits the prompt unexpectedly.
 * @throws {Error} For any other unexpected errors during the process.
 */
export const rmCommandFunc = async () => {
        try {

                console.log("Welcome to RaptorJS rmCommand script");

                const CmdDir = `${path.resolve(process.cwd())}/src/commands/`;
                const raptorConfig = JSON.parse(await readFile("./raptor.config.json", "utf-8"));
                const extension = raptorConfig.ts ? "ts" : "js";
                const files = await readdir(CmdDir);

                const commands = files
                        .filter((file) => file.endsWith(`.${extension}`) && file !== `handler.${extension}`)
                        .map((file) => {
                                const name = path.basename(file, `.${extension}`);
                                const fullPath = path.join(CmdDir, file);
                                return { name, value: fullPath };
                        });

                if (commands.length === 0) {
                        console.log("No commands found to delete.");
                        exit(0);
                }

                const commandPath = await select({
                        message: 'Which command do you want to delete:',
                        choices: commands
                });

                const commandName = commands.find(cmd => cmd.value === commandPath)?.name;

                if (await confirm({message:`Are you sure you want to delete the "${commandName}" command?`})) {
                        const logger = new Logger();
                        removeFile(commandPath, logger);
                        console.log(`Command "${commandName}" has been deleted successfully!`);
                }

        } catch (err) {
                if (err instanceof ExitPromptError) {
                        exit(1);
                } else {
                        console.error("Unexpected error:", err);
                        exit(1);
                }
        }
};
