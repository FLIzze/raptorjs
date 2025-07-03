import { ExitPromptError } from "@inquirer/core";
import {exit} from "process";
import path from 'path';
import { readFile,readdir,writeFile } from "fs/promises";
import { select, confirm } from "@inquirer/prompts";
import prettier from "prettier";
import { loadOpt } from "../../utils/loadOpt.js";
import { addFile } from "../../utils/file.js";


/**
 * Asynchronously removes an option from a selected command file in the RaptorJS project.
 *
 * This function:
 * - Lists available command files in the `src/commands/` directory.
 * - Prompts the user to select a command and an option to remove.
 * - Confirms the removal with the user.
 * - Updates the command file by removing the selected option from its options array.
 * - Formats the updated file using Prettier.
 *
 * @async
 * @function rmOptFunc
 * @throws {ExitPromptError} If the user exits the prompt.
 * @throws {Error} If an unexpected error occurs during the process.
 */
export const rmOptFunc = async () => {
    try {
    
        console.log("Welcome to RaptorJS rmOpt script");

        const CmdDir = `${path.resolve(process.cwd())}/src/commands/`
        const raptorConfig = JSON.parse(await readFile("./raptor.config.json", "utf-8"))
        const extension = raptorConfig.ts ? "ts" : "js";
        const files = await readdir(CmdDir)

        const commands = files
            .filter((file) => file.endsWith(`.${extension}`) && file !== `handler.${extension}`)
            .map((file) => {
                const name = path.basename(file, `.${extension}`);
                const fullPath = path.join(CmdDir, file);
                return { name, value: fullPath };
            });
        

        const commandPath = await select({
            message: 'Which command do you want remove option:',
            choices: commands
        })

        const commandName = commands.find(cmd => cmd.value === commandPath)?.name;

        const OldOpt = await loadOpt(commandPath);

        if (OldOpt.length === 0) {
            console.log(`No options found for the "${commandName}" command.`);
            exit(0);
        }
        
        const choices = OldOpt.map(opt => ({
            name:opt.name,
            value: opt.name,
            description: opt.description
        }))

        const optToDelete = await select({
            message: 'Which option do you want remove:',
            choices: choices
        })

        if (await confirm({message:`Are you sure you want to delete ths option "${optToDelete}" from "${commandName}" command`})) {

            const Options = OldOpt.filter(opt => opt.name !== optToDelete);

            const content = await readFile(commandPath, "utf-8");

            const updated = content.replace(
                /options\s*:\s*\[[\s\S]*?\]/,
                `options: ${JSON.stringify(Options, null, 2)}`
            )

            const formatted = await prettier.format(updated, {
                parser: commandPath.endsWith(".ts") ? "typescript" : "babel",
            });

            await addFile(commandPath, formatted);
            console.log(`Options updated in ${commandPath}`);
        } else {
            exit(0)
        }

    } catch (err) {
        if (err instanceof ExitPromptError) {
            exit(1)
        } else {
            console.error("Unexpected error:", err);
            exit(1);
        }
    }
};