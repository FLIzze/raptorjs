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

/**
 * Logger utility for console and file output.
 *
 * @example
 * const logger = new Logger();
 * logger.info('Application started');
 */
export class Logger {
        /**
         * Initializes the logger with a log file path.
         *
         * @param {string} [logPath] - Optional custom log file path.
         */
        constructor(logPath) {
                this.path = logPath ?? path.join(__dirname, "..", "log", "raptorjs.log");
                this.buildLogFile();
        }

        /**
         * Ensures the log directory and file exist.
         */
        buildLogFile() {
                const dir = path.dirname(this.path);
                if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                }
                if (!fs.existsSync(this.path)) {
                        fs.writeFileSync(this.path, "");
                        this.info("Log file created");
                }
        }

        /**
         * Returns a formatted timestamp.
         *
         * @returns {string}
         */
        date() {
                const date = new Date();
                const pad = (n, len = 2) => String(n).padStart(len, '0');

                const day = pad(date.getDate());
                const month = pad(date.getMonth() + 1);
                const year = String(date.getFullYear()).slice(-2);
                const hour = pad(date.getHours());
                const min = pad(date.getMinutes());
                const sec = pad(date.getSeconds());
                const ms = pad(date.getMilliseconds(), 3);

                return `[${day}-${month}-${year}T${hour}:${min}:${sec}.${ms}Z]`;
        }

        /**
         * Adds ANSI color codes to message.
         *
         * @param {string} message - Log message.
         * @param {string} color - Color name (green, yellow, red, blue, cyan).
         * @returns {string}
         */
        colorize(message, color) {
                return `${ANSI_COLORS[color] ?? ""}${message}${ANSI_COLORS.reset}`;
        }

        /**
         * Logs an informational message.
         *
         * @param {string} message - Message to log.
         * @example
         * logger.info("Server is running");
         */
        info(message) {
                const mes = this.date() + " INFO: " + message;
                fs.appendFileSync(this.path, mes + "\n");
                console.log(this.colorize(mes, "green"));
        }

        /**
         * Logs a warning message.
         *
         * @param {string} message - Message to log.
         * @example
         * logger.warn("Disk space running low");
         */
        warn(message) {
                const mes = this.date() + " WARN: " + message;
                fs.appendFileSync(this.path, mes + "\n");
                console.log(this.colorize(mes, "yellow"));
        }

        /**
         * Logs an error message.
         *
         * @param {string} message - Message to log.
         * @example
         * logger.error("Database connection failed");
         */
        error(message) {
                const mes = this.date() + " ERROR: " + message;
                fs.appendFileSync(this.path, mes + "\n");
                console.log(this.colorize(mes, "red"));
        }

        /**
         * Logs a debug message.
         *
         * @param {string} message - Message to log.
         * @example
         * logger.debug("Query executed with ID 42");
         */
        debug(message) {
                const mes = this.date() + " DEBUG: " + message;
                fs.appendFileSync(this.path, mes + "\n");
                console.log(this.colorize(mes, "blue"));
        }

        /**
         * Logs a trace-level message.
         *
         * @param {string} message - Message to log.
         * @example
         * logger.trace("Function entered: parseData()");
         */
        trace(message) {
                const mes = this.date() + " TRACE: " + message;
                fs.appendFileSync(this.path, mes + "\n");
                console.log(this.colorize(mes, "cyan"));
        }
}
