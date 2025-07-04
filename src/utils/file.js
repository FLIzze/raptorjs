import fsp from "fs/promises";
import { Logger } from "../logs/logger.js";

/**
 * @param {string} src
 * @param {string} dest
 * @param {Logger} logger
 */
export async function copyFile(src, dest, logger) {
        try {
                await fsp.copyFile(src, dest);
                logger.info(`Copied file from ${src} to ${dest}`);
        } catch (err) {
                logger.error(`Error copying file: ${err.message}`);
        }
}

/**
 * @param {string} oldPath
 * @param {string} newPath
 * @param {Logger} logger
 */
export async function renameFile(oldPath, newPath, logger) {
        try {
                await fsp.rename(oldPath, newPath);
                logger.info(`Renamed file from ${oldPath} to ${newPath}`);
        } catch (err) {
                logger.error(`Error renaming file: ${err.message}`);
        }
}

/**
 * @param {string} filePath
 * @param {string} content
 * @param {Logger} logger
 */
export async function writeFile(filePath, logger, content = "") {
        try {
                await fsp.writeFile(filePath, content);
                logger.info(`Created file at ${filePath}`);
        } catch (err) {
                logger.error(`Error creating file: ${err.message}`);
        }
}

/**
 * @param {string} filePath
 * @param {Logger} logger
 */
export async function removeFile(filePath, logger) {
        try {
                await fsp.unlink(filePath);
                logger.info(`Removed file at ${filePath}`);
        } catch (err) {
                logger.error(`Error removing file: ${err.message}`);
        }
}

/**
 * Reads and parses a JSON file.
 * @param {string} filePath - Path to the JSON file.
 * @param {Logger} logger
 * @param {boolean} [isJson] - Set to true to parse json
 * @returns {Promise<any>} Parsed JSON content.
 */
export async function readFile(filePath, logger, isJson = false) {
        try {
                const content = await fsp.readFile(filePath, 'utf-8');

                if (isJson) {
                        return JSON.parse(content);
                }

                return content;
        } catch (err) {
                logger.error(`Error reading JSON file at ${filePath}: ${err.message}`);
                throw err;
        }
}
