import fsp from "fs/promises";

/**
 * @param {string} src
 * @param {string} dest
 */
export async function copyTo(src, dest) {
        try {
                await fsp.copyFile(src, dest);
                console.log(`Copied file from ${src} to ${dest}`);
        } catch (err) {
                console.error(`Error copying file: ${err.message}`);
        }
}

