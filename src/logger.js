import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANSI_COLORS = {
        reset: "\x1b[0m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        red: "\x1b[31m",
        blue: "\x1b[34m",
        cyan: "\x1b[36m"
};

export class Logger {
        constructor(logPath){
                this.path = logPath ?? path.join(__dirname, "..", "log", "raptorjs.log");
                this.buildLogFile();
        }

        buildLogFile () {
                const dir = path.dirname(this.path);
                if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir, { recursive: true });
                }
                if (!fs.existsSync(this.path)){
                        fs.writeFileSync(this.path, "");
                        this.info("le fichier log a bien été créé");
                }
        }

        date () {
                const date = new Date();

                const jour = String(date.getDate()).padStart(2, '0');
                const mois = String(date.getMonth() + 1).padStart(2, '0');
                const annee = String(date.getFullYear()).slice(-2);

                const heures = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const secondes = String(date.getSeconds()).padStart(2, '0');
                const miliseconde = String(date.getMilliseconds()).padStart(2, '0');

                return `[${jour}-${mois}-${annee}T${heures}:${minutes}:${secondes}.${miliseconde}Z]`;
        }

        colorize(message, color) {
                return `${ANSI_COLORS[color] ?? ""}${message}${ANSI_COLORS.reset}`;
        }

        info (message) {
                const mes = this.date() + "INFO:" + message;
                fs.appendFileSync(this.path, mes + "\n");
                console.log(this.colorize(mes, "green"));
        }

        warn (message) {
                const mes = this.date() + "WARN:" + message;
                fs.appendFileSync(this.path, mes + "\n");
                console.log(this.colorize(mes, "yellow"));
        }

        error (message) {
                const mes = this.date() + "ERROR:" + message;
                fs.appendFileSync(this.path, mes + "\n");
                console.log(this.colorize(mes, "red"));
        } 

        debug (message) {
                const mes = this.date() + "DEBUG:" + message;
                fs.appendFileSync(this.path, mes + "\n");
                console.log(this.colorize(mes, "blue"));
        }

        trace (message) {
                const mes = this.date() + "TRACE:" + message;
                fs.appendFileSync(this.path, mes + "\n");
                console.log(this.colorize(mes, "cyan"));
        }
}
