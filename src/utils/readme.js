import fsp from "fs/promises";
import fs from "fs";
import path from "path";
import { Logger } from "../logs/logger.js";

const logger = new Logger();

/**
 * @typedef {Object} CommandEntry
 * @property {string} timestamp
 * @property {string} command
 * @property {string} description
 * @property {Object} data
 */

export class ReadmeManager {
    constructor() {
        this.readmePath = path.join(process.cwd(), "README.md");
        this.historyFile = path.join(process.cwd(), ".raptor-history.json");
    }

    /**
     * Initialize history file if it doesn't exist
     */
    async initHistoryFile() {
        if (!fs.existsSync(this.historyFile)) {
            await fsp.writeFile(this.historyFile, JSON.stringify([], null, 2));
            logger.info("History file created");
        }
    }

    /**
     * Read command history
     * @returns {CommandEntry[]}
     */
    async readHistory() {
        try {
            await this.initHistoryFile();
            const data = await fsp.readFile(this.historyFile, 'utf-8');
            return JSON.parse(data);
        } catch (err) {
            logger.error(`Error reading history: ${err.message}`);
            return [];
        }
    }

    /**
     * Add entry to history
     * @param {string} command
     * @param {string} description  
     * @param {Object} data
     */
    async addToHistory(command, description, data = {}) {
        try {
            const history = await this.readHistory();
            const entry = {
                timestamp: new Date().toISOString(),
                command,
                description,
                data
            };
            
            history.unshift(entry);
            
            // Keep only the last 20 entries
            if (history.length > 20) {
                history.splice(20);
            }
            
            await fsp.writeFile(this.historyFile, JSON.stringify(history, null, 2));
            logger.info(`Added to history: ${command}`);
        } catch (err) {
            logger.error(`Error adding to history: ${err.message}`);
        }
    }

    /**
     * Read current README content
     * @returns {string}
     */
    async readReadme() {
        try {
            if (!fs.existsSync(this.readmePath)) {
                return "";
            }
            return await fsp.readFile(this.readmePath, 'utf-8');
        } catch (err) {
            logger.error(`Error reading README: ${err.message}`);
            return "";
        }
    }

    /**
     * Generate command history section
     * @returns {string}
     */
    async generateHistorySection() {
        const history = await this.readHistory();
        
        if (history.length === 0) {
            return `## 📝 Command History

*No commands executed yet*

`;
        }

        let section = `## 📝 Command History

`;

        history.forEach((entry, index) => {
            const date = new Date(entry.timestamp).toLocaleString('en-US');
            section += `${index + 1}. **${entry.command}** - ${entry.description} *(${date})*\n`;
            
            // Add details based on command type
            if (entry.data && Object.keys(entry.data).length > 0) {
                if (entry.command === 'addModel' && entry.data.modelName) {
                    section += `   - Model created: \`${entry.data.modelName}\`\n`;
                } else if (entry.command === 'addCommand' && entry.data.commandName) {
                    section += `   - Discord command created: \`${entry.data.commandName}\`\n`;
                } else if (entry.command === 'renameModel' && entry.data.oldName && entry.data.newName) {
                    section += `   - Renamed: \`${entry.data.oldName}\` → \`${entry.data.newName}\`\n`;
                } else if (entry.command === 'deleteModel' && entry.data.name) {
                    section += `   - Model deleted: \`${entry.data.name}\`\n`;
                } else if (entry.command === 'migrate' && Array.isArray(entry.data)) {
                    section += `   - Models migrated: ${entry.data.map(f => `\`${f.replace('.js', '')}\``).join(', ')}\n`;
                } else if (entry.command === 'init' && entry.data.projectName) {
                    section += `   - Project: \`${entry.data.projectName}\`, Language: \`${entry.data.language}\`, Database: \`${entry.data.sqlite ? 'SQLite' : 'None'}\`\n`;
                }
            }
            section += '\n';
        });

        return section;
    }

    /**
     * Generate Discord commands section
     * @returns {string}
     */
    async generateCommandsSection() {
        try {
            const commandsDir = path.join(process.cwd(), "src", "commands");
            
            if (!fs.existsSync(commandsDir)) {
                return `## 🤖 Discord Commands

*No commands created yet*

`;
            }

            const commandFiles = fs.readdirSync(commandsDir)
                .filter(file => (file.endsWith('.js') || file.endsWith('.ts')) && file !== 'handler.js' && file !== 'handler.ts');
            
            if (commandFiles.length === 0) {
                return `## 🤖 Discord Commands

*No commands created yet*

`;
            }

            let section = `## 🤖 Discord Commands

`;

            commandFiles.forEach((file, index) => {
                const commandName = file.replace(/\.(js|ts)$/, '');
                section += `${index + 1}. \`/${commandName}\` - \`src/commands/${file}\`\n`;
            });

            section += '\n';
            return section;
        } catch (err) {
            logger.error(`Error generating commands section: ${err.message}`);
            return `## 🤖 Discord Commands

*Error reading commands*

`;
        }
    }

    /**
     * Generate current models section
     * @returns {string}
     */
    async generateModelsSection() {
        try {
            const modelsDir = path.join(process.cwd(), "src", "models");
            
            if (!fs.existsSync(modelsDir)) {
                return `## 🗃️ Data Models

*No models created yet*

`;
            }

            const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
            
            if (modelFiles.length === 0) {
                return `## 🗃️ Data Models

*No models created yet*

`;
            }

            let section = `## 🗃️ Data Models

`;

            modelFiles.forEach((file, index) => {
                const modelName = file.replace('.js', '');
                section += `${index + 1}. \`${modelName}\` - \`src/models/${file}\`\n`;
            });

            section += '\n';
            return section;
        } catch (err) {
            logger.error(`Error generating models section: ${err.message}`);
            return `## 🗃️ Data Models

*Error reading models*

`;
        }
    }

    /**
     * Update README with automatic sections
     */
    async updateReadme() {
        try {
            let content = await this.readReadme();
            
            // If README is empty or doesn't exist, use base template
            if (!content.trim()) {
                content = await this.getBaseTemplate();
            }

            // Remove old automatic sections
            content = this.removeAutoSections(content);
            
            // Generate new sections
            const historySection = await this.generateHistorySection();
            const modelsSection = await this.generateModelsSection();
            const commandsSection = await this.generateCommandsSection();
            
            // Add sections at the end
            content += `\n<!-- AUTO-GENERATED SECTIONS - DO NOT EDIT MANUALLY -->\n`;
            content += historySection;
            content += commandsSection;
            content += modelsSection;
            content += `<!-- END AUTO-GENERATED SECTIONS -->\n`;
            
            await fsp.writeFile(this.readmePath, content);
            logger.success("README updated automatically");
        } catch (err) {
            logger.error(`Error updating README: ${err.message}`);
        }
    }

    /**
     * Remove existing auto-generated sections
     * @param {string} content
     * @returns {string}
     */
    removeAutoSections(content) {
        const startMarker = "<!-- AUTO-GENERATED SECTIONS - DO NOT EDIT MANUALLY -->";
        const endMarker = "<!-- END AUTO-GENERATED SECTIONS -->";
        
        const startIndex = content.indexOf(startMarker);
        if (startIndex !== -1) {
            const endIndex = content.indexOf(endMarker);
            if (endIndex !== -1) {
                content = content.substring(0, startIndex).trim();
            }
        }
        
        return content;
    }

    /**
     * Get base template for new README
     * @returns {string}
     */
    async getBaseTemplate() {
        const projectName = path.basename(process.cwd());
        const configPath = path.join(process.cwd(), "raptor.config.json");
        let isTs = false;
        
        try {
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(await fsp.readFile(configPath, 'utf-8'));
                isTs = config.ts === true;
            }
        } catch (err) {
            // Ignore error, stay with JS default
        }

        return `# ${projectName}

Discord Bot project created with **RaptorJS Framework**

## 🚀 Quick Start

To run the bot:
\`\`\`bash
bun run bot
\`\`\`

To use framework commands:
\`\`\`bash
npx raptorjs <command>
\`\`\`

## 📋 Available Commands

- \`npx raptorjs addModel <name>\` - Add a new model
- \`npx raptorjs migrate\` - Migrate models to database  
- \`npx raptorjs renameModel <old> <new>\` - Rename a model
- \`npx raptorjs deleteModel <name>\` - Delete a model
- \`npx raptorjs rollback\` - Rollback last action
- \`npx raptorjs generateReadme\` - Regenerate this README

## 📁 Project Structure

\`\`\`
${projectName}/
├── .env                 # Environment variables
├── README.md           # This file
├── raptor.config.json  # RaptorJS configuration
├── package.json        # Project dependencies
└── src/
    ├── index.${isTs ? 'ts' : 'js'}         # Bot entry point
    ├── commands/        # Discord commands
    └── models/          # Data models
\`\`\`

---

*README automatically generated by RaptorJS. Sections below are updated automatically.*
`;
    }

    /**
     * Completely regenerate README
     */
    async regenerateReadme() {
        try {
            const baseTemplate = await this.getBaseTemplate();
            await fsp.writeFile(this.readmePath, baseTemplate);
            await this.updateReadme();
            logger.success("README completely regenerated");
        } catch (err) {
            logger.error(`Error regenerating README: ${err.message}`);
        }
    }
}
