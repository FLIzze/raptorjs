#!/usr/bin/env node
export type CommandEntry = {
    description: string;
    requiredArgs?: number;
    handler: (args: string[]) => Promise<void> | void;
};
