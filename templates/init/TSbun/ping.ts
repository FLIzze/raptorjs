import { Logger } from "raptorjs-discord"
const logger = new Logger()


export const PingCommand = {

    name:"ping",
    description:"reply : Pong!",
    options:[],

    cmd : async (interaction: { reply: (arg0: string) => any; client: { user: { username: any } }; user: { tag: any } }) => {
        await interaction.reply('Pong!')
        logger.info(`The ping command was used. The bot "${interaction.client.user.username}" replied to the user "${interaction.user.tag}".`)
    }

}
