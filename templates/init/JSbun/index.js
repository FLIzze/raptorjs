import { CmdHandler } from './commands/handler.js';
import dotenv from 'dotenv';
import { Logger } from 'raptorjs-discord'

dotenv.config();
const logger = new Logger();

import { Client, GatewayIntentBits, Events } from 'discord.js';

const handlercmd = new CmdHandler()
handlercmd.init()

const TOKEN = process.env.BOT_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
    logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

	handlercmd.handleCmd(interaction)
});

client.login(TOKEN);
