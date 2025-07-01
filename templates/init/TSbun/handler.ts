import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { REST, Routes } from 'discord.js';
import type { Command } from '../../type';
import { Logger } from 'raptorjs-discord';

const logger = new Logger()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKENBOT = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!CLIENT_ID) {
    throw new Error('CLIENT_ID environment variable is not defined.');
}

if (!TOKENBOT) {
    throw new Error('BOT_TOKEN environment variable is not defined.');
}
const rest = new REST({ version: '10' }).setToken(TOKENBOT);

/**
 * Command Handler 
 * 
 * @example
 * const cmdHandler = new CmdHandler();
 * const cmdHandler.init();
 */

export class CmdHandler {
    commands: Command[];

    /**
     * Initializes the cmdHandler
     */
    constructor() {
        this.commands = [];
    }

    /**
     * Initializes the command handler by loading all command modules from the specified directory.
     * 
     * - Reads all `.js` files in the given directory (excluding the current file).
     * - Dynamically imports each command module.
     * - Extracts and registers commands that have both `name` and `cmd` properties.
     * - Updates the internal commands list and refreshes Discord commands.
     * 
     * @async
     * @param {string} [commandsDir=__dirname] - The directory containing command modules.
     * @returns {Promise<void>}
     */
    async init(commandsDir = __dirname) {
        try {
            const files = fs.readdirSync(commandsDir)
                .filter(file => file.endsWith('.ts') && file !== path.basename(__filename));

            const importedModules = await Promise.all(
                files.map(file => import(pathToFileURL(path.join(commandsDir, file)).href))
            );

            const loadedCommands: Command[] = [];

            for (const module of importedModules) {
                for (const key in module) {
                    const command = module[key];
                    if (command?.name && command?.cmd) {
                        loadedCommands.push(command);
                    }
                }
            }

            this.commands = loadedCommands;

            logger.info(`Loaded ${this.commands.length} command(s).`);
            await this.refreshDiscordCommands();

        } catch (err) {
            logger.error('Error initializing commands:', err);
        }
    }

    /**
     * Synchronizes the current list of commands with the Discord API.
     * Maps local command definitions to the API format and updates them via a REST call.
     * Logs the number of commands synchronized or an error if the update fails.
     *
     * @async
     * @returns {Promise<void>} Resolves when the commands have been refreshed.
     */
    async refreshDiscordCommands() {
        try {
            const apiCommands = this.commands.map(({ name, description, options }) => ({ name, description, options }));

            await rest.put(Routes.applicationCommands(CLIENT_ID!), { body: apiCommands });

            logger.info(`${apiCommands.length} command(s) synchronized with the Discord API.`);
        } catch (err) {
            logger.error('Failed to update commands on Discord:', err);
        }
    }

    /**
     * Handles an incoming command interaction.
     *
     * Checks if the interaction is a command, finds the corresponding command handler,
     * and executes it. Replies with an error message if the command is unknown or if
     * an error occurs during execution.
     *
     * @async
     * @param {import('discord.js').CommandInteraction} interaction - The interaction object representing the command.
     * @returns {Promise<void>}
     */
    async handleCmd(interaction: { isCommand?: any; reply?: any; commandName?: any; }) {
        if (!interaction.isCommand?.()) return;

        const { commandName } = interaction;

        const command = this.commands.find(cmd => cmd.name === commandName);

        if (!command) {
            await interaction.reply({ content: "Unknown command.", ephemeral: true });
            return;
        }

        try {
            await command.cmd(interaction);
        } catch (err) {
            logger.error(`Error in command "${commandName}":`, err);
            await interaction.reply({ content: "An error occurred while executing the command.", ephemeral: true });
        }
    }
}