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
    constructor(logPath?: string);
    /** @type {string} */
    path: string;
    /**
     * Logs SQL queries to console and file.
     * @param {string} sql - The SQL query string.
     * @param {Array} [params=[]] - Optional query parameters.
     */
    sql(sql: string, params?: any[]): void;
    /**
     * Ensures the log directory and file exist.
     */
    buildLogFile(): void;
    /**
     * Returns a formatted timestamp.
     *
     * @returns {string}
     */
    date(): string;
    /**
     * Adds ANSI color codes to message.
     *
     * @param {string} message - Log message.
     * @param {string} color - Color name (green, yellow, red, blue, cyan).
     * @returns {string}
     */
    colorize(message: string, color: string): string;
    /**
     * Logs an informational message.
     *
     * @param {string} message - Message to log.
     * @example
     * logger.info("Server is running");
     */
    info(message: string): void;
    /**
     * Logs a warning message.
     *
     * @param {string} message - Message to log.
     * @example
     * logger.warn("Disk space running low");
     */
    warn(message: string): void;
    /**
     * Logs an error message.
     *
     * @param {string} message - Message to log.
     * @example
     * logger.error("Database connection failed");
     */
    error(message: string): void;
    /**
     * Logs a debug message.
     *
     * @param {string} message - Message to log.
     * @example
     * logger.debug("Query executed with ID 42");
     */
    debug(message: string): void;
    /**
     * Logs a trace-level message.
     *
     * @param {string} message - Message to log.
     * @example
     * logger.trace("Function entered: parseData()");
     */
    trace(message: string): void;
    /**
     * Logs a success message.
     *
     * @param {string} message - Message to log.
     * @example
     * logger.success("Function entered: parseData()");
     */
    success(message: string): void;
}
