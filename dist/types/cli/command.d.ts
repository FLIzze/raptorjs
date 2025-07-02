export class Command {
    commandsFolderUrl: URL;
    pwd: string;
    filename: string;
    dirname: string;
    npxpath: string;
    db: Database;
    rollback: Rollback;
    logger: Logger;
    init(): Promise<void>;
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
     * @param {string} type
     * @param {any} data
     * @param {string} recoveryMessage
     */
    register(type: string, data: any, recoveryMessage: string): void;
}
import { Database } from "../db/database.js";
import { Rollback } from "../db/rollback.js";
import { Logger } from "../logs/logger.js";
