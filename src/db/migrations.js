import fs from 'fs';
import path from 'path';
import {getDB} from './database.js';
import {pathToFileURL} from 'url';

export async function migrateModels() {
        const modelDir = path.join(process.cwd(), 'src/models');
        const files = fs.readdirSync(modelDir).filter(file => file.endsWith(".js"));
        const db = await getDB();

        for (const file of files) {
                try {
                        const modelPath = pathToFileURL(path.join(modelDir, file)).pathname;
                        const { tableName, fields }  = await import(modelPath);

                        const columns = Object.entries(fields)
                                .map(([name, type]) => `${name} ${type}`)
                                .join(', ');

                        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;
                        await db.exec(sql);
                } catch (err) {
                        console.error(`Failed to migrate ${file}:`, err);
                }
        }
}
