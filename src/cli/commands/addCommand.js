import {input} from "@inquirer/prompts";
import {exit} from "process";
import {ExitPromptError} from "@inquirer/core";
import {existsSync} from "fs";
import {writeFile} from '../../utils/file.js';
import {readFile} from "fs/promises";
import path from 'path';
import {askOpts} from "../../utils/askOpts.js";
import prettier from "prettier";

/**
 * Interactive CLI function to add a new command file for RaptorJS Discord bots.
 * 
 * This function prompts the user for a command name, description, and options,
 * then generates a new command file (JavaScript or TypeScript based on config)
 * in the `src/commands/` directory. It ensures command name validity and uniqueness,
 * formats the generated code with Prettier, and handles errors gracefully.
 * 
 * @async
 * @function
 * @throws {ExitPromptError} If the user cancels the prompt.
 * @throws {Error} For unexpected errors during file operations or formatting.
 */
export const addCommandFunc = async () => {
        try {

                console.log("Welcome to RaptorJS addCommand script");

                const CmdDir = `${path.resolve(process.cwd())}/src/commands/`;
                const raptorConfig = JSON.parse(await readFile("./raptor.config.json", "utf-8"));

                const commandName = await input({
                        message: 'What is your new command name ?',
                        validate: (value) => {
                                if (!value || value.trim() === "") return "Command name is required";
                                if (/[/\\?%*:|"<>]/.test(value)) return "Command name contains invalid characters";
                                if (value !== value.toLowerCase()) return "Command name must be in lowercase";
                                if (existsSync(`./src/commands/${value}.js`) || existsSync(`./src/commands/${value}.ts`)) return "This Command name is already taken";
                                return true;
                        }
                });
                const description = await input({
                        message: `What is ${commandName} command description ?`,
                        validate: (value) => {
                                if (!value || value.trim() === "") return "Command description is required";
                                return true;
                        }
                });

                const options = await askOpts();

                let code = "";

                if (!raptorConfig.ts) {
                        code = `\
import { Logger } from "raptorjs-discord"
const logger = new Logger()

export const ${commandName}Command = {

    name:"${commandName}",
    description:"${description}",
    options:${JSON.stringify(options, null, 2)},

    cmd : async (interaction) => {
        await interaction.reply('${commandName} reponse !')
        logger.info(\`The ${commandName} command was used. The bot "\${interaction.client.user.username}" replied to the user "\${interaction.user.tag}".\`)
    }

}`;
                } else if (raptorConfig.ts) {
                        code = `\
import { Logger } from "raptorjs-discord"
const logger = new Logger()

export const ${commandName}Command = {

    name:"${commandName}",
    description:"${description}",
    options:${JSON.stringify(options, null, 2)},

    cmd : async (interaction: { reply: (arg0: string) => any; client: { user: { username: any } }; user: { tag: any } }) => {
        await interaction.reply('${commandName} reponse !')
        logger.info(\`The ${commandName} command was used. The bot "\${interaction.client.user.username}" replied to the user "\${interaction.user.tag}".\`)
    }

}`;
                } else {
                        console.log("probleme");
                }

                const formatted = await prettier.format(code, {parser: raptorConfig.ts ? "typescript" : "babel"});

                await writeFile(`${CmdDir}${commandName}.${raptorConfig.ts ? "ts" : "js"}`, formatted);

        } catch (err) {
                if (err instanceof ExitPromptError) {
                        exit(1);
                } else {
                        console.error("Unexpected error:", err);
                        exit(1);
                }
        }

};
