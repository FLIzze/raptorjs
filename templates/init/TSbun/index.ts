import dotenv from 'dotenv';
import { Logger } from 'raptorjs-discord';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { CmdHandler } from './commands/handler';

dotenv.config();
const logger = new Logger()
const handleCmd = new CmdHandler()

handleCmd.init()

const TOKEN = process.env.BOT_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
        logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on('interactionCreate', async interaction => {
       if (!interaction.isChatInputCommand()) return;
       
       handleCmd.handleCmd(interaction);
});

client.login(TOKEN);
