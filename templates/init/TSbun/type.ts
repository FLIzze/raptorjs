export interface CommandOpt {
    name:string;
    description:string;
    type:number;
    required:boolean;
} 

export interface Command {
    name: string;
    description: string;
    options: CommandOpt[];
    cmd: (interaction: any) => Promise<void>;
}