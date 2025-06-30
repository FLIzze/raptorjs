import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, Events } from 'discord.js';

const TOKEN = process.env.BOT_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(TOKEN);
