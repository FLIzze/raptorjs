import fs from 'fs';
import path from 'path';
import {pathToFileURL, fileURLToPath} from 'url';
        
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {Database} = await import(pathToFileURL(path.join(__dirname, "./database.js")).href);

export async function migrateModels() {
        const modelDir = path.join(process.cwd(), 'src/models');
        const files = fs.readdirSync(modelDir).filter(file => file.endsWith(".js"));
        const db = new Database();

        console.log("Starting migration...");
        for (const file of files) {
                try {
                        const modelPath = pathToFileURL(path.join(modelDir, file)).pathname;
                        const { fields }  = await import(modelPath);

                        const columns = Object.entries(fields)
                                .map(([name, type]) => `${name} ${type}`)
                                .join(', ');

                        const sql = `CREATE TABLE IF NOT EXISTS ${file.split('.')[0]} (${columns});`;
                        await db.run(sql);
                } catch (err) {
                        console.error(`Failed to migrate ${file}:`, err);
                        return;
                }
        }

        console.log("Successfully migrated!");
}
