import path from 'path';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { pathToFileURL } from 'url';
import fs from 'fs';
import { Logger } from '../logs/logger.js';

sqlite3.verbose();

/**
 * Lightweight SQLite ORM-like wrapper.
 *
 * @example
 * const db = new Database();
 * await db.insert('users', { name: 'Jane Doe', age: 28 });
 * const users = await db.findAll('users');
 */
export class Database {
        constructor() {
                this.logger = new Logger();

                this.db = new sqlite3.Database('db.sqlite', (err) => {
                        if (err) {
                                this.logger.error(`Failed to connect to DB: ${err}`);
                        } else {
                                this.logger.info('Database initialized');
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
         * Retrieves specific column(s) from the table.
         *
         * @param {string} table - The table name.
         * @param {string} column - The column to retrieve.
         * @returns {Promise<Array<Object>>}
         * @example
         * const names = await db.find('users', 'name');
         */
        async find(table, column) {
                try {
                        const sql = `SELECT ${column} FROM ${table}`;

                        this.log(sql);

                        return await this.all(sql);
                } catch (err) {
                        this.logger.error(`find failed: ${err}`);
                }
        }

        /**
         * Finds rows matching the specified conditions.
         *
         * @param {string} table - The table name.
         * @param {Object} conditions - Column-value filters.
         * @returns {Promise<Array<Object>>}
         * @example
         * const users = await db.findWhere('users', { name: 'Jane Doe' });
         */
        async findWhere(table, conditions) {
                try {
                        const keys = Object.keys(conditions);
                        const clause = keys.map(k => `${k} = ?`).join(' AND ');
                        const values = keys.map(k => conditions[k]);
                        const sql = `SELECT * FROM ${table} WHERE ${clause}`;
                                
                        this.log(sql, values);

                        return await this.all(sql, values);
                } catch (err) {
                        this.logger.error(`findWhere failed: ${err}`);
                }
        }

        /**
         * Updates rows matching given conditions.
         *
         * @param {string} table - The table name.
         * @param {Object} data - The data to update (column-value pairs).
         * @param {Object} conditions - Conditions to match (column-value).
         * @returns {Promise<void>}
         * @example
         * await db.update('users', { age: 29 }, { name: 'Jane Doe' });
         */
        async update(table, data, conditions) {
                try {
                        const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
                        const whereClause = Object.keys(conditions).map(k => `${k} = ?`).join(' AND ');
                        const values = [...Object.values(data), ...Object.values(conditions)];
                        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

                        this.log(sql, values);

                        await this.run(sql, values);
                } catch (err) {
                        this.logger.error(`Update failed: ${err}`);
                }
        }

        /**
         * Deletes rows matching the specified conditions.
         *
         * @param {string} table - The table name.
         * @param {Object} conditions - Column-value conditions to match.
         * @returns {Promise<void>}
         * @example
         * await db.delete('users', { name: 'Jane Doe' });
         */
        async delete(table, conditions) {
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
         *
         * Each model file must export a `fields` object defining columns.
         *
         * @returns {Promise<void>}
         * @example
         * await db.migrate();
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
}

const db = new Database();
export default db;
