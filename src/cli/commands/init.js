import {input, select, confirm} from "@inquirer/prompts";
import {ExitPromptError} from "@inquirer/core";
import {chdir, exit} from "process";
import {mkdir} from "fs/promises";
import {existsSync} from "fs";
import {execSync} from "child_process";
import {copyFile, addFile} from '../../utils/file.js';
import {ReadmeManager} from '../../utils/readme.js';

export const initFunc = async (frameworkpath) => {
        console.log("Welcome to RaptorJS init script");

        try {
                const projectName = await input({
                        message: 'What is your project name ?',
                        validate: (value) => {
                                if (!value || value.trim() === "") return "Project name is required";
                                if (/[/\\?%*:|"<>]/.test(value)) return "Project name contains invalid characters";
                                if (existsSync(`./${value}`)) return "This project name is already taken";
                                return true;
                        }
                });

                const language = await select({
                        message: 'Select language',
                        choices: [
                                {name: 'JS', value: 'js'},
                                {name: 'TS', value: 'ts'},
                        ]
                });

                const sqlite = await confirm({message:'Would you like to use a sqlite database ?'});

                await mkdir(`./${projectName}/src/commands`, {recursive: true});

                chdir(`${projectName}`);

                if (language === "js") {
                        await copyFile(`${frameworkpath}/templates/init/JSbun/.gitignore_sample`, ".gitignore");
                        await copyFile(`${frameworkpath}/templates/init/JSbun/bun.lock`, "bun.lock");
                        await copyFile(`${frameworkpath}/templates/init/JSbun/jsconfig.json`, "jsconfig.json");
                        await addFile("raptor.config.json", JSON.stringify({
                                ts: false,
                                projectName: projectName,
                                language: "javascript",
                                runtime: "bun",
                                database: sqlite
                        }, null, 2));
                        await copyFile(`${frameworkpath}/templates/init/JSbun/index.js`, "./src/index.js");
                        await copyFile(`${frameworkpath}/templates/init/JSbun/handler.js`, "./src/commands/handler.js");
                        await copyFile(`${frameworkpath}/templates/init/JSbun/ping.js`, "./src/commands/ping.js");
                        await addFile("package.json", JSON.stringify({
                                name: projectName,
                                module: "src/index.js",
                                type: "module",
                                scripts: {
                                        bot: "bun run src/index.js"
                                },
                                devDependencies: {
                                        "@types/bun": "latest"
                                },
                                peerDependencies: {
                                        "typescript": "^5.0.0"
                                }
                        }, null, 2));
                } else if (language === "ts") {
                        await copyFile(`${frameworkpath}/templates/init/TSbun/.gitignore_sample`, ".gitignore");
                        await copyFile(`${frameworkpath}/templates/init/TSbun/bun.lock`, "bun.lock");
                        await copyFile(`${frameworkpath}/templates/init/TSbun/tsconfig.json`, "tsconfig.json");
                        await addFile("raptor.config.json", JSON.stringify({
                                ts: true,
                                projectName: projectName,
                                language: "typescript",
                                runtime: "bun",
                                database: sqlite
                        }, null, 2));
                        await copyFile(`${frameworkpath}/templates/init/TSbun/index.ts`, "./src/index.ts");
                        await copyFile(`${frameworkpath}/templates/init/TSbun/type.ts`, "./src/type.ts");
                        await copyFile(`${frameworkpath}/templates/init/TSbun/handler.ts`, "./src/commands/handler.ts");
                        await copyFile(`${frameworkpath}/templates/init/TSbun/ping.ts`, "./src/commands/ping.ts");
                        await addFile("package.json", JSON.stringify({
                                name: projectName,
                                module: "src/index.ts",
                                type: "module",
                                scripts: {
                                        bot: "bun run src/index.ts"
                                },
                                devDependencies: {
                                        "@types/bun": "latest"
                                },
                                peerDependencies: {
                                        "typescript": "^5.0.0"
                                }
                        }, null, 2));
                }

                await copyFile(`${frameworkpath}/templates/init/.env_sample`, ".env");

                const readmeManager = new ReadmeManager();
                await readmeManager.regenerateReadme();
                
                await readmeManager.addToHistory('init', `Project ${projectName} initialized with ${language.toUpperCase()}`, {
                        projectName,
                        language,
                        sqlite,
                        runtime: 'bun'
                });
                
                await readmeManager.updateReadme();

                execSync("bun i", {stdio: "inherit"});
                execSync("bun i discord.js dotenv raptorjs-discord", {stdio: "inherit"});

                if (sqlite) {
                        execSync("bun i sqlite3", {stdio: "inherit"});
                }

                console.log(`\n✅ Project ${projectName} created successfully!`);
                console.log(`📝 README automatically generated with command history`);

        } catch (err) {
                if (err instanceof ExitPromptError) {
                        exit(1);
                } else {
                        console.error("Unexpected error:", err);
                        exit(1);
                }
        }
};
