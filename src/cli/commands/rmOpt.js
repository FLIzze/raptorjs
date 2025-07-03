import { ExitPromptError } from "@inquirer/core";
import {exit} from "process";
import path from 'path';
import { readFile,readdir,writeFile } from "fs/promises";
import { confirm, select } from "@inquirer/prompts";
import prettier from "prettier";
import { loadOpt } from "../../utils/loadOpt.js";
import { askOpts } from "../../utils/askOpts.js";
import { addFile } from "../../utils/file.js";

export const rmOptFunc = async () => {
    try {
    
        console.log("Welcome to RaptorJS addOpt script");

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

        const OldOpt = await loadOpt(commandPath);
        
        const choices = OldOpt.map(opt => ({
            name:opt.name,
            value: opt.name,
            description: opt.description
        }))

        const optToDelete = await select({
            message: 'Which option do you want remove:',
            choices: choices
        })

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

    } catch (err) {
        if (err instanceof ExitPromptError) {
            exit(1)
        } else {
            console.error("Unexpected error:", err);
            exit(1);
        }
    }
};