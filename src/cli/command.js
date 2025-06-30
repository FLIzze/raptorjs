import {exec, spawn} from "child_process";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {fileURLToPath} from "url";
import {copyTo} from "../utils/copyTo.js";
import {homedir} from "os";

export class Command {
        constructor() {
                this.commandsFolderUrl = new URL("./commands/", import.meta.url);
                this.pwd = process.cwd();
                this.home = homedir();
        }

        init() {
                const initCommandUrl = new URL("init.sh", this.commandsFolderUrl);
                const initCommandPath = fileURLToPath(initCommandUrl);
                this.execFile(initCommandPath);
        }

        update() {
                console.log("Updating the repository...");
                exec(`git pull ${path.join(this.home, ".raptorjs")}`, (error, _, stderr) => {
                        if (error) {
                                console.error(`Error updating the repository: ${error.message}`);
                                return;
                        }
                        if (stderr) {
                                console.error(`stderr updating the repository: ${stderr}`);
                                return;
                        }
                        console.log("Successfully updated the repository!");
                });
        }

        /**
         * Adds a model file from templates to project src/models directory.
         * @param {string} modelName
         */
        async addModel(modelName) {
                const configFilePath = path.join(this.pwd, "raptor.conf.json");
                if (!fs.existsSync(configFilePath)) {
                        console.error("Please run this command from the project root directory.");
                        return;
                }

                const source = path.join(this.home, ".raptorjs", "templates", "db", "model.js");
                const targetDir = path.join(this.pwd, "src", "models");

                try {
                        await fsp.mkdir(targetDir, {recursive: true});
                } catch (err) {
                        console.error(`Error creating models directory: ${err.message}`);
                        return;
                }

                const target = path.join(targetDir, `${modelName}.js`);

                await copyTo(source, target);
                console.log(`Model successfully added as ${target}`);
        }

        /**
         * Executes a shell script file with arguments.
         * @param {string} filePath
         * @param {string[]} args
         */
        execFile(filePath, args = []) {
                const child = spawn("bash", [filePath, ...args], {stdio: "inherit"});

                child.on("error", (err) => {
                        console.error(`Failed to start subprocess: ${err}`);
                });
        }

        /**
         * Adds a Discord command file from templates to project src/commands directory.
         * @param {string} commandName
         */
        async addCommand(commandName) {
                const configFilePath = path.join(this.pwd, "raptor.conf.json");
                if (!fs.existsSync(configFilePath)) {
                        console.error("Please run this command from the project root directory.");
                        return;
                }

                const source = path.join(this.home, ".raptorjs", "templates", "commands", "command.js");
                const targetDir = path.join(this.pwd, "src", "commands");

                try {
                        await fsp.mkdir(targetDir, {recursive: true});
                } catch (err) {
                        console.error(`Error creating commands directory: ${err.message}`);
                        return;
                }

                const target = path.join(targetDir, `${commandName}.js`);

                // Read template and replace placeholders
                let templateContent = await fsp.readFile(source, 'utf8');
                templateContent = templateContent.replace(/COMMAND_NAME/g, commandName);

                await fsp.writeFile(target, templateContent);
                console.log(`Discord command successfully added as ${target}`);
        }

        /**
         * Lists all Discord commands in the project
         */
        async listCommands() {
                const configFilePath = path.join(this.pwd, "raptor.conf.json");
                if (!fs.existsSync(configFilePath)) {
                        console.error("Please run this command from the project root directory.");
                        return;
                }

                const commandsDir = path.join(this.pwd, "src", "commands");
                
                if (!fs.existsSync(commandsDir)) {
                        console.log("No commands directory found. Use 'raptorjs addCommand <name>' to add commands.");
                        return;
                }

                const files = await fsp.readdir(commandsDir);
                const commandFiles = files.filter(file => file.endsWith('.js'));

                if (commandFiles.length === 0) {
                        console.log("No commands found in src/commands/");
                        return;
                }

                console.log("\n📋 Discord Commands Found:");
                console.log("=" * 40);

                for (const file of commandFiles) {
                        try {
                                const filePath = path.join(commandsDir, file);
                                const commandModule = await import(pathToFileURL(filePath).href);
                                const command = commandModule.command || commandModule.default?.command;
                                
                                if (command) {
                                        console.log(`\n🔧 ${command.name}`);
                                        console.log(`   Description: ${command.description}`);
                                        console.log(`   Usage: ${command.usage}`);
                                        console.log(`   Category: ${command.category}`);
                                } else {
                                        console.log(`\n⚠️  ${file} - Invalid command format`);
                                }
                        } catch (err) {
                                console.log(`\n❌ ${file} - Error loading: ${err.message}`);
                        }
                }
                console.log("\n" + "=" * 40);
        }

        /**
         * Generates a README with all Discord commands documentation
         */
        async generateReadme() {
                const configFilePath = path.join(this.pwd, "raptor.conf.json");
                if (!fs.existsSync(configFilePath)) {
                        console.error("Please run this command from the project root directory.");
                        return;
                }

                const commandsDir = path.join(this.pwd, "src", "commands");
                
                if (!fs.existsSync(commandsDir)) {
                        console.log("No commands directory found. Nothing to document.");
                        return;
                }

                const files = await fsp.readdir(commandsDir);
                const commandFiles = files.filter(file => file.endsWith('.js'));

                // Parse commands data
                const commands = [];
                const categories = {};

                for (const file of commandFiles) {
                        try {
                                const filePath = path.join(commandsDir, file);
                                const commandModule = await import(pathToFileURL(filePath).href + '?t=' + Date.now());
                                const command = commandModule.command || commandModule.default?.command;
                                
                                if (command) {
                                        commands.push(command);
                                        if (!categories[command.category]) {
                                                categories[command.category] = [];
                                        }
                                        categories[command.category].push(command);
                                }
                        } catch (err) {
                                console.warn(`Warning: Could not load command ${file}: ${err.message}`);
                        }
                }

                // Generate README content
                const projectName = path.basename(this.pwd);
                let readmeContent = this.generateReadmeContent(projectName, categories, commands);

                // Write README
                const readmePath = path.join(this.pwd, "COMMANDS.md");
                await fsp.writeFile(readmePath, readmeContent);
                
                console.log(`✅ Commands documentation generated: ${readmePath}`);
                console.log(`📊 Total commands documented: ${commands.length}`);
        }

        /**
         * Generates the README content with commands documentation
         * @param {string} projectName 
         * @param {Object} categories 
         * @param {Array} commands 
         * @returns {string}
         */
        generateReadmeContent(projectName, categories, commands) {
                const now = new Date().toLocaleString('fr-FR');
                
                let content = `# 🤖 ${projectName} - Commandes Discord

> Documentation automatiquement générée par RaptorJS  
> Dernière mise à jour : ${now}

## 📊 Statistiques

- **Total de commandes :** ${commands.length}
- **Catégories :** ${Object.keys(categories).length}

## 🗂️ Commandes par catégorie

`;

                // Generate commands by category
                for (const [categoryName, categoryCommands] of Object.entries(categories)) {
                        content += `### ${categoryName}\n\n`;
                        
                        for (const command of categoryCommands) {
                                content += `#### \`${command.name}\`\n\n`;
                                content += `**Description :** ${command.description}\n\n`;
                                content += `**Usage :** \`${command.usage}\`\n\n`;
                                
                                if (command.permissions && command.permissions.length > 0) {
                                        content += `**Permissions requises :** ${command.permissions.join(', ')}\n\n`;
                                }
                                
                                if (command.cooldown && command.cooldown > 0) {
                                        content += `**Cooldown :** ${command.cooldown}s\n\n`;
                                }
                                
                                content += `---\n\n`;
                        }
                }

                // Generate table summary
                content += `## 📋 Résumé des commandes

| Commande | Description | Catégorie | Cooldown |
|----------|-------------|-----------|----------|
`;

                for (const command of commands.sort((a, b) => a.name.localeCompare(b.name))) {
                        content += `| \`${command.name}\` | ${command.description} | ${command.category} | ${command.cooldown || 0}s |\n`;
                }

                content += `

## 🚀 Comment utiliser

1. Invitez le bot sur votre serveur Discord
2. Utilisez les commandes avec le préfixe approprié (slash commands ou préfixe)
3. Consultez l'usage de chaque commande ci-dessus

## 🔧 Développement

Ce bot a été développé avec **RaptorJS** - Framework Discord Bot

Pour ajouter une nouvelle commande :
\`\`\`bash
raptorjs addCommand <nom_commande>
\`\`\`

Pour régénérer cette documentation :
\`\`\`bash
raptorjs generateReadme
\`\`\`

---
*Documentation générée automatiquement par RaptorJS v${this.getFrameworkVersion()}*
`;

                return content;
        }

        /**
         * Gets the framework version from package.json
         * @returns {string}
         */
        getFrameworkVersion() {
                try {
                        const packagePath = path.join(this.home, ".raptorjs", "package.json");
                        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                        return packageContent.version || '0.6.01';
                } catch {
                        return '0.6.01';
                }
        }
}

