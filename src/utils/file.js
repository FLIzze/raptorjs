import fsp from "fs/promises";
import { Logger } from "../logs/logger.js";

const logger = new Logger();

/**
 * @param {string} src
 * @param {string} dest
 */
export async function copyFile(src, dest) {
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
 */
export async function renameFile(oldPath, newPath) {
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
 */
export async function addFile(filePath, content = "") {
        try {
                await fsp.writeFile(filePath, content);
                logger.info(`Created file at ${filePath}`);
        } catch (err) {
                logger.error(`Error creating file: ${err.message}`);
        }
}

/**
 * @param {string} filePath
 */
export async function removeFile(filePath) {
        try {
                await fsp.unlink(filePath);
                logger.info(`Removed file at ${filePath}`);
        } catch (err) {
                logger.error(`Error removing file: ${err.message}`);
        }
}
