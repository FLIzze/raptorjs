import { ExitPromptError } from "@inquirer/core";
import {exit} from "process";
import path from 'path';
import { readFile,readdir } from "fs/promises";
import { confirm, select } from "@inquirer/prompts";
import { removeFile } from "../../utils/file";

export const rmCommandFunc = async () => {
    try {

        console.log("Welcome to RaptorJS rmCommand script")

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
            message: 'Which command do you want to delete:',
            choices: commands
        })

        const commandName = commands.find(cmd => cmd.value === commandPath)?.name;

        if (await confirm({message:`Are you sure you want to delete the "${commandName}" command?`})) {
            removeFile(commandPath);
            console.log(`Command "${commandName}" has been deleted successfully!`)
        }

    } catch (err) {
        if (err instanceof ExitPromptError) {
            exit(1)
        } else {
            console.error("Unexpected error:", err);
            exit(1);
        }
    }
}