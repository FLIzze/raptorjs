import {exec} from "child_process";
import {fileURLToPath} from "url";

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
                exec(filePath, (error, stdout, stderr) => {
                        if (error) {
                                console.error(`Execution error: ${error}`);
                                return;
                        }

                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);
                });
        }
}

const commandsFolderUrl = new URL("./commands/", import.meta.url);
const command = new Command();

command.init();
