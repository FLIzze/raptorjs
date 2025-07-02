import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { Logger } from '../logs/logger.js';

sqlite3.verbose();

/**
 * SQLite ORM
 *
 * @example
 * await db.insert('users', { name: 'Jane Doe', age: 28 });
 * const users = await db.find('users');
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

                        this.logger.sql(sql, values);

                        await this.run(sql, values);
                } catch (err) {
                        this.logger.error(`Insert failed: ${err}`);
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

                        this.logger.sql(sql, values);
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

                        this.logger.sql(sql, values);

                        await this.run(sql, values);
                } catch (err) {
                        this.logger.error(`Delete failed: ${err}`);
                }
        }

        /**
         * You should not use this command but instead `renameModel`
         *
         * @param {string} oldName 
         * @param {string} newName
         * @returns {Promise<void>}
         * @example 
         * await db.renameTable("users", "people");
         */
        async renameTable(oldName, newName) {
                const sql = `ALTER TABLE ${oldName} RENAME TO ${newName}`;

                this.logger.sql(sql);

                try {
                        await this.run(sql);
                        this.logger.info(`Renamed table "${oldName}" to "${newName}"`);
                } catch (err) {
                        this.logger.error(`Rename table failed: ${err}`);
                }
        }

        /**
         * @returns {Promise<Array<{ name: string }>>}
         */
        async getTable() {
                const sql = "SELECT name FROM sqlite_master WHERE type='table';";

                this.logger.sql(sql);

                try {
                        const tables = await this.all(sql);
                        return tables;
                } catch (err) {
                        this.logger.error(`Could not get table name:  ${err}`);
                }
        }

        /**
         * You should not use this command but instead `deleteModel`
         *
         * @param {string} name
         * @returns {Promise<void>}
         */
        async dropTable(name) {
                const sql = `DROP TABLE IF EXISTS ${name}`;

                this.logger.sql(sql);

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

                        this.logger.sql(sql, values);

                        await this.run(sql, values);

                        this.logger.info(`Updated rows in table "${table}"`);
                } catch (err) {
                        this.logger.error(`Update failed: ${err}`);
                }
        }

        /**
         * You should not use this command but instead `addModel` then `migrate`
         * @param {string} tableName
         * @param {string | Array<string>} columns
         */
        async createTable(tableName, columns) {
                try {
                        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;

                        this.logger.sql(sql);
                        await this.run(sql);
                        this.logger.info(`Created table ${tableName} with columns ${columns}`);
                } catch (err) {
                        this.logger.error(`Table creation failed: ${err}`);
                }
        }
}
