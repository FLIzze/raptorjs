/**
 * @typedef {Object} DeleteModelData
 * @property {string} name
 * @property {Array<string>} keysName
 * @property {Array<string>} keysType
 * @property {Array<string>} values
 */
/**
 * @typedef {Object} RenameModelData
 * @property {string} oldName
 * @property {string} newName
 */
/**
 * @typedef {Object} AddModelData
 * @property {string} modelName
 */
/**
 * @typedef {Object} RollbackEntry
 * @property {"deleteModel"} type
 * @property {DeleteModelData} data
 * @property {string} recoveryMessage
 */
/**
 * @typedef {Object} RenameRollbackEntry
 * @property {"renameModel"} type
 * @property {RenameModelData} data
 * @property {string} recoveryMessage
 */
/**
 * @typedef {Object} AddRollbackEntry
 * @property {"addModel"} type
 * @property {AddModelData} data
 * @property {string} recoveryMessage
 */
/**
 * @typedef {Object} MigrateRollbackEntry
 * @property {"migration"} type
 * @property {string[]} data
 * @property {string} recoveryMessage
 */
/**
 * @typedef {RollbackEntry | RenameRollbackEntry | AddRollbackEntry | MigrateRollbackEntry} AnyRollbackEntry
 */
export class Rollback {
    /** @type {string} */
    path: string;
    /** @type {Database} */
    db: Database;
    /** @type {Logger} */
    logger: Logger;
    buildBackupFile(): void;
    /**
     * @param {RollbackEntry} entry
     */
    register(entry: RollbackEntry): void;
    /**
     * @returns {RollbackEntry[]}
     */
    read(): RollbackEntry[];
    init(): Promise<void>;
    /**
     * @param {AnyRollbackEntry} rollbackData
     */
    handleRollbackType(rollbackData: AnyRollbackEntry): Promise<void>;
}
export type DeleteModelData = {
    name: string;
    keysName: Array<string>;
    keysType: Array<string>;
    values: Array<string>;
};
export type RenameModelData = {
    oldName: string;
    newName: string;
};
export type AddModelData = {
    modelName: string;
};
export type RollbackEntry = {
    type: "deleteModel";
    data: DeleteModelData;
    recoveryMessage: string;
};
export type RenameRollbackEntry = {
    type: "renameModel";
    data: RenameModelData;
    recoveryMessage: string;
};
export type AddRollbackEntry = {
    type: "addModel";
    data: AddModelData;
    recoveryMessage: string;
};
export type MigrateRollbackEntry = {
    type: "migration";
    data: string[];
    recoveryMessage: string;
};
export type AnyRollbackEntry = RollbackEntry | RenameRollbackEntry | AddRollbackEntry | MigrateRollbackEntry;
import { Database } from "./database.js";
import { Logger } from "../logs/logger.js";
