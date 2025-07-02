import {input, select, confirm} from "@inquirer/prompts";
import {ExitPromptError} from "@inquirer/core";
import {chdir, exit} from "process";
import {existsSync} from "fs";
import {execSync} from "child_process";
import {mkdir, copyFile, writeFile} from "fs/promises";
import {ReadmeManager} from '../../utils/readme.js';

/**
 * @param {string} frameworkpath
 */
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
                        const jsPath = `${frameworkpath}/templates/init/JSbun/`;
                        await copyFile(`${jsPath}.gitignore_sample`, ".gitignore");
                        await copyFile(`${jsPath}bun.lock`, "bun.lock");
                        await copyFile(`${jsPath}jsconfig.json`, "jsconfig.json");
                        await copyFile(`${jsPath}raptor.config.json`, "raptor.config.json");
                        await copyFile(`${jsPath}index.js`, "./src/index.js");
                        await copyFile(`${jsPath}handler.js`, "./src/commands/handler.js");
                        await copyFile(`${jsPath}ping.js`, "./src/commands/ping.js");
                        await writeFile("package.json", JSON.stringify({
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
                } if (language === "ts") {
                        const tsPath = `${frameworkpath}/templates/init/TSbun/`;
                        await copyFile(`${tsPath}.gitignore_sample`, ".gitignore");
                        await copyFile(`${tsPath}bun.lock`, "bun.lock");
                        await copyFile(`${tsPath}tsconfig.json`, "tsconfig.json");
                        await copyFile(`${tsPath}raptor.config.json`, "raptor.config.json");
                        await copyFile(`${tsPath}index.ts`, "./src/index.ts");
                        await copyFile(`${tsPath}type.ts`, "./src/type.ts");
                        await copyFile(`${tsPath}handler.ts`, "./src/commands/handler.ts");
                        await copyFile(`${tsPath}ping.ts`, "./src/commands/ping.ts");
                        await writeFile("package.json", JSON.stringify({
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

                console.log(`\nProject ${projectName} created successfully!`);
                console.log(`README automatically generated with command history`);

        } catch (err) {
                if (err instanceof ExitPromptError) {
                        exit(1);
                } else {
                        console.error("Unexpected error:", err);
                        exit(1);
                }
        }
};
