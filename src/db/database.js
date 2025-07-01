import path from 'path';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { pathToFileURL } from 'url'; import fs from 'fs';
import { Logger } from '../logs/logger.js';

sqlite3.verbose();

/**
 * Lightweight SQLite ORM-like wrapper.
 *
 * @example
 * await db.insert('users', { name: 'Jane Doe', age: 28 });
 * const users = await db.findAll('users');
 */
export class Database {
        constructor() {
                this.logger = new Logger();
                this.db = new sqlite3.Database('db.sqlite', (err) => {
                        if (err) {
                                this.logger.error(`Failed to connect to DB: ${err}`);
                        }
                });

                this.run = promisify(this.db.run.bind(this.db));
                this.all = promisify(this.db.all.bind(this.db));
        }

        /**
         * Logs SQL queries to console and file.
         * @param {string} sql - The SQL query string.
         * @param {Array} [params=[]] - Optional query parameters.
         */
        log(sql, params = []) {
                this.logger.debug(`[SQL] ${sql} ${params.length ? JSON.stringify(params) : ''}`);
        }

        /**
         * Inserts a row into the specified table.
         *
         * @param {string} table - The table name.
         * @param {Object} data - The data to insert (column-value pairs).
         * @returns {Promise<void>}
         * @example
         * await db.insert('users', { name: 'Jane Doe', age: 28 });
         */
        async insert(table, data) {
                try {
                        const keys = Object.keys(data);
                        const placeholders = keys.map(() => '?').join(', ');
                        const values = keys.map(k => data[k]);
                        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;

                        this.log(sql, values);

                        await this.run(sql, values);
                } catch (err) {
                        this.logger.error(`Insert failed: ${err}`);
                }
        }

        /**
         * Retrieves all rows from the specified table.
         *
         * @param {string} table - The table name.
         * @returns {Promise<Array<Object>>}
         * @example
         * const users = await db.findAll('users');
         */
        async findAll(table) {
                try {
                        const sql = `SELECT * FROM ${table}`;

                        this.log(sql);

                        return await this.all(sql);
                } catch (err) {
                        this.logger.error(`findAll failed: ${err}`);
                }
        }

        /**
         * Retrieves specific column(s) from the table with optional conditions.
         *
         * @param {string} table - The table name.
         * @param {string|string[]} columns - Column name(s) to retrieve. Use '*' for all.
         * @param {Object} [conditions] - Optional WHERE clause conditions.
         * @returns {Promise<Array<Object>>}
         * @example
         * const users = await db.find('users'); // All columns, all rows
         * const names = await db.find('users', 'name'); // Just 'name' column
         * const filtered = await db.find('users', ['name', 'age'], { age: 30 });
         */
        async find(table, columns = '*', conditions = {}) {
                try {
                        const cols = Array.isArray(columns) ? columns.join(', ') : columns;
                        let sql = `SELECT ${cols} FROM ${table}`;
                        let values = [];

                        if (conditions && Object.keys(conditions).length > 0) {
                                const clause = Object.keys(conditions).map(k => `${k} = ?`).join(' AND ');
                                values = Object.values(conditions);
                                sql += ` WHERE ${clause}`;
                        }

                        this.log(sql, values);
                        return await this.all(sql, values);
                } catch (err) {
                        this.logger.error(`find failed: ${err}`);
                }
        }

        /**
         * Deletes rows matching the specified conditions.
         *
         * @param {string} table - The table name.
         * @param {Object} conditions - Column-value conditions to match.
         * @returns {Promise<void>}
         * @example
         * await db.deleteWhere('users', { name: 'Jane Doe' });
         */
        async deleteWhere(table, conditions) {
                try {
                        const clause = Object.keys(conditions).map(k => `${k} = ?`).join(' AND ');
                        const values = Object.values(conditions);
                        const sql = `DELETE FROM ${table} WHERE ${clause}`;

                        this.log(sql, values);

                        await this.run(sql, values);
                } catch (err) {
                        this.logger.error(`Delete failed: ${err}`);
                }
        }

        /**
         * Creates tables from model definitions in `src/models`.
         * Each model file must export a `fields` object defining columns.
         *
         * @returns {Promise<void>}
         */
        async migrate() {
                const modelDir = path.join(process.cwd(), 'src/models');
                const files = fs.readdirSync(modelDir).filter(file => file.endsWith('.js'));

                this.logger.info('Starting migration...');

                for (const file of files) {
                        try {
                                const modelPath = pathToFileURL(path.join(modelDir, file)).href;
                                const mod = await import(modelPath);
                                const fields = mod.fields || mod.default?.fields;

                                if (!fields) {
                                        this.logger.warn(`Skipping ${file}: No 'fields' export found`);
                                        continue;
                                }

                                const columns = Object.entries(fields)
                                        .map(([name, type]) => `${name} ${type}`)
                                        .join(', ');
                                const sql = `CREATE TABLE IF NOT EXISTS ${file.split('.')[0]} (${columns});`;

                                this.log(sql);

                                await this.run(sql);
                        } catch (err) {
                                this.logger.error(`Migration failed for ${file}: ${err}`);
                        }
                }
                this.logger.info('Migration completed.');
        }


        /**
         * @param {string} oldName
         * @param {string} newName
         * @returns {Promise<void>}
         * @example 
         * await db.renameTable("users", "people");
         */
        async renameTable(oldName, newName) {
                const sql = `ALTER TABLE ${oldName} RENAME TO ${newName}`;

                this.log(sql);

                try {
                        await this.run(sql);
                        this.logger.info(`Renamed table "${oldName}" to "${newName}"`);
                } catch (err) {
                        this.logger.error(`Rename table failed: ${err}`);
                }
        }

        /**
         * @param {string} name
         * @returns {Promise<void>}
         * @example 
         * await db.dropTable("users");
         */
        async dropTable(name) {
                const sql = `DROP TABLE IF EXISTS ${name}`;

                this.log(sql);

                try {
                        await this.run(sql);
                        this.logger.info(`Dropped table "${name}"`);
                } catch (err) {
                        this.logger.error(`Drop table failed: ${err}`);
                }
        }

        /**
         * Updates rows in the specified table that match given conditions.
         *
         * @param {string} table - The table name.
         * @param {Object} data - The column-value pairs to update.
         * @param {Object} conditions - The WHERE clause conditions.
         * @returns {Promise<void>}
         * @example
         * await db.update('users', { age: 29 }, { name: 'Jane Doe' });
         * this updates age where name is 'Jane Doe'
         */
        async update(table, data, conditions) {
                try {
                        if (!data || Object.keys(data).length === 0) {
                                throw new Error('No data provided to update.');
                        }

                        if (!conditions || Object.keys(conditions).length === 0) {
                                throw new Error('Update conditions are required to prevent full table overwrite.');
                        }

                        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
                        const setValues = Object.values(data);

                        const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
                        const whereValues = Object.values(conditions);

                        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
                        const values = [...setValues, ...whereValues];

                        this.log(sql, values);

                        await this.run(sql, values);

                        this.logger.info(`Updated rows in table "${table}"`);
                } catch (err) {
                        this.logger.error(`Update failed: ${err}`);
                }
        }
}

const db = new Database();
export default db;
