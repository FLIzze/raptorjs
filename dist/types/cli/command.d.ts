export class Command {
    static init(): Promise<Command>;
    /**
     * @param {"js" | "ts"} extension
     */
    constructor(extension: "js" | "ts");
    /** @type {URL} */
    commandsFolderUrl: URL;
    /** @type {string} */
    pwd: string;
    /** @type {string} */
    filename: string;
    /** @type {string} */
    dirname: string;
    /** @type {string} */
    npxpath: string;
    /** @type {Database} */
    db: Database;
    /** @type {Rollback} */
    rollback: Rollback;
    /** @type {Logger} */
    logger: Logger;
    /** @type {"js" | "ts"} */
    extension: "js" | "ts";
    /**
     * @param {string} modelName
     */
    addModel(modelName: string): Promise<void>;
    /**
     * @param {string} oldName
     * @param {string} newName
     */
    renameModel(oldName: string, newName: string): Promise<void>;
    /**
     * @param {string} name
     */
    deleteModel(name: string): Promise<void>;
    migrate(): Promise<void>;
    /**
     * @param {"deleteModel" | "renameModel" | "addModel" | "migration"} type
     * @param {any} data
     * @param {string} recoveryMessage
     */
    register(type: "deleteModel" | "renameModel" | "addModel" | "migration", data: any, recoveryMessage: string): void;
}
import { Database } from "../db/database.js";
import { Rollback } from "../db/rollback.js";
import { Logger } from "../logs/logger.js";
