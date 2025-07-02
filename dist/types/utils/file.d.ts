/**
 * @param {string} src
 * @param {string} dest
 */
export function copyFile(src: string, dest: string): Promise<void>;
/**
 * @param {string} oldPath
 * @param {string} newPath
 */
export function renameFile(oldPath: string, newPath: string): Promise<void>;
/**
 * @param {string} filePath
 * @param {string} content
 */
export function addFile(filePath: string, content?: string): Promise<void>;
/**
 * @param {string} filePath
 */
export function removeFile(filePath: string): Promise<void>;
/**
 * Reads and parses a JSON file.
 * @param {string} filePath - Path to the JSON file.
 * @returns {Promise<any>} Parsed JSON content.
 */
export function readFile(filePath: string): Promise<any>;
