import { readFile } from "fs/promises"

/**
 * Asynchronously loads and parses the "options" array from a file.
 *
 * The function reads the file at the given path, extracts the array assigned to the `options` property,
 * attempts to convert it into valid JSON, and returns it as a JavaScript array.
 * If parsing fails or the `options` array is not found, it returns an empty array.
 *
 * @async
 * @param {string} path - The file path to read and extract options from.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of option objects, or an empty array if parsing fails.
 */
export const loadOpt = async (path) => {
    const content = await readFile(path, "utf-8");

    const match = content.match(/options\s*:\s*\[([\s\S]*?)\]/);
    if (!match) return []

    const raw = `[${match[1]}]`;

    try {
        const jsonCompatible = raw
        .replace(/(\w+):/g, '"$1":')
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/,(\s*[}\]])/g, '$1');

        return JSON.parse(jsonCompatible);
    } catch (err) {
        console.warn("❌ Erreur lors du parse des options :", err);
        return [];
    }
}