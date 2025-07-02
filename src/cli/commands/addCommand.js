import { input } from "@inquirer/prompts";
import { existsSync } from "fs";

export const addCommandFunc = async () => {
    try {
        const commandName = await input({
            message: 'What is your command name ?',
            validate: (value) => {
                if (!value || value.trim() === "") return "Command name is required";
                if (/[/\\?%*:|"<>]/.test(value)) return "Command name contains invalid characters";
                if (existsSync(`./src/commands/${value}.js`) || existsSync(`./src/commands/${value}.ts`)) return "This Command name is already taken";
                return true;
            }
        })
        const description = await input({
            message: 'What is your command description ?',
            validate: (value) => {
                if (!value || value.trim() === "") return "Command description is required";
                return true;
            }
        })
        
        const code = `\
import { Logger } from "raptorjs-discord"
const logger = new Logger()

export const PingCommand = {

    name:"${commandName}",
    description:"${description}",
    options:[],

    cmd : async (interaction) => {
        await interaction.reply('Pong!')
        logger.info(\`The ping command was used. The bot "\${interaction.client.user.username}" replied to the user "\${interaction.user.tag}".\`)
    }

}`
        console.log(code)
    } catch (err) {
        if (err instanceof ExitPromptError) {
            exit(1)
        } else {
            console.error("Unexpected error:", err);
            exit(1);
        }
    }
    
};