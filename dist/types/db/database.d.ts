/**
 * SQLite ORM
 *
 * @example
 * await db.insert('users', { name: 'Jane Doe', age: 28 });
 * const users = await db.find('users');
 */
export class Database {
    logger: Logger;
    db: sqlite3.Database;
    run: Function;
    all: Function;
    /**
     * Inserts a row into the specified table.
     *
     * @param {string} table - The table name.
     * @param {Object} data - The data to insert (column-value pairs).
     * @returns {Promise<void>}
     * @example
     * await db.insert('users', { name: 'Jane Doe', age: 28 });
     */
    insert(table: string, data: any): Promise<void>;
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
    find(table: string, columns?: string | string[], conditions?: any): Promise<Array<any>>;
    /**
     * Deletes rows matching the specified conditions.
     *
     * @param {string} table - The table name.
     * @param {Object} conditions - Column-value conditions to match.
     * @returns {Promise<void>}
     * @example
     * await db.deleteWhere('users', { name: 'Jane Doe' });
     */
    deleteWhere(table: string, conditions: any): Promise<void>;
    /**
     * You should not use this command but instead `renameModel`
     *
     * @param {string} oldName
     * @param {string} newName
     * @returns {Promise<void>}
     * @example
     * await db.renameTable("users", "people");
     */
    renameTable(oldName: string, newName: string): Promise<void>;
    /**
     * @returns {Promise<Array<{ name: string }>>}
     */
    getTable(): Promise<Array<{
        name: string;
    }>>;
    /**
     * You should not use this command but instead `deleteModel`
     *
     * @param {string} name
     * @returns {Promise<void>}
     */
    dropTable(name: string): Promise<void>;
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
    update(table: string, data: any, conditions: any): Promise<void>;
    /**
     * You should not use this command but instead `addModel` then `migrate`
     * @param {string} tableName
     * @param {string | Array<string>} columns
     */
    createTable(tableName: string, columns: string | Array<string>): Promise<void>;
}
import { Logger } from '../logs/logger.js';
import sqlite3 from 'sqlite3';
