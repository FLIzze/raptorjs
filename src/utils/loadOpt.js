import { readFile } from "fs/promises"

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