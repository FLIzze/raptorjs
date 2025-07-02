import fsp from "fs/promises";

/**
 * @param {string} src
 * @param {string} dest
 */
export async function copyFile(src, dest) {
        try {
                await fsp.copyFile(src, dest);
                console.log(`Copied file from ${src} to ${dest}`);
        } catch (err) {
                console.error(`Error copying file: ${err.message}`);
        }
}

/**
 * @param {string} oldPath
 * @param {string} newPath
 */
export async function renameFile(oldPath, newPath) {
        try {
                await fsp.rename(oldPath, newPath);
                console.log(`Renamed file from ${oldPath} to ${newPath}`);
        } catch (err) {
                console.error(`Error renaming file: ${err.message}`);
        }
}

/**
 * @param {string} filePath
 * @param {string} content
 */
export async function addFile(filePath, content = "") {
        console.log(filePath);
        try {
                await fsp.writeFile(filePath, content);
                console.log(`Created file at ${filePath}`);
        } catch (err) {
                console.error(`Error creating file: ${err.message}`);
        }
}

/**
 * @param {string} filePath
 */
export async function removeFile(filePath) {
        try {
                await fsp.unlink(filePath);
                console.log(`Removed file at ${filePath}`);
        } catch (err) {
                console.error(`Error removing file: ${err.message}`);
        }
}
