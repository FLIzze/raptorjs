import sqlite3 from 'sqlite3';
import {promisify} from 'util';

sqlite3.verbose();

export class Database {
        constructor() {
                this.db = new sqlite3.Database('db.sqlite', (err) => {
                        if (err) {
                                console.error('Failed to connect:', err);
                        } else {
                                console.log('DB initialized');
                        }
                });

                this.run = promisify(this.db.run.bind(this.db));
                this.all = promisify(this.db.all.bind(this.db));
        }

        /**
         * @param {string} tableName 
         * @param {{unknown}} data 
         */
        async insert(tableName, data) {
                try {
                        const keys = Object.keys(data);
                        const placeholders = keys.map(() => '?').join(', ');
                        const values = keys.map(k => data[k]);

                        const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
                        await this.run(sql, values);
                } catch (err) {
                        console.error(`Error inserting: ${err}`);
                }
        }

        /**
         * @param {string} tableName 
         */
        async findAll(tableName) {
                try {
                        const sql = `SELECT * FROM ${tableName}`;
                        return await this.all(sql);
                } catch (err) {
                        console.error(`Error selecting: ${err}`);
                }
        }
}

// async () => {
//         const db = new Database();

//         await db.insert('users', {name: 'Dlice', email: 'dlice@example.com'});

//         const users = await db.findAll('users');
//         console.log(users);
// };
