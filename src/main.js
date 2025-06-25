import {spawn} from "child_process";
import {fileURLToPath} from "url";

const commandsFolderUrl = new URL("./commands/", import.meta.url);

class Command {
        /**
         * Init the project
         */
        init() {
                const initCommandUrl = new URL("init.sh", commandsFolderUrl);
                const initCommandPath = fileURLToPath(initCommandUrl);
                this.execFile(initCommandPath);
        }

        /**
         * Execute the (.sh) file with given filePath
         * @param {string} filePath
         */
        execFile(filePath) {
                const child = spawn("bash", [filePath], {
                        stdio: "inherit" 
                });

                child.on("error", (err) => {
                        console.error(`Failed to start subprocess: ${err}`);
                });

                // child.on("exit", (code) => {
                //         console.log(`Process exited with code ${code}`);
                // });
        }
}

const command = new Command();
command.init();
