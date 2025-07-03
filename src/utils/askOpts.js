import { confirm, input, select } from "@inquirer/prompts";

export const askOpts = async (optexists=[]) => {
    let whantOpts = await confirm({message:'do you whant option for your command ?'})

    const options = []

    while (whantOpts) {
        const name = await input({
            message: 'What is your option name ?',
                validate: (value) => {
                    if (!value || value.trim() === "") return "Option name is required";
                    if (/[/\\?%*:|"<>]/.test(value)) return "Option name contains invalid characters";
                    if (value !== value.toLowerCase()) return "Option name must be in lowercase";
                    if (options.some(opt => opt.name === value) || optexists.some(opt => opt.name === value)) return "This option name is already taken";
                    return true;
                }
        })

        const description = await input({
            message: 'What is your option description ?',
            validate: (value) => {
                if (!value || value.trim() === "") return "Command description is required";
                return true;
            }
        })

        const type = await select({
            message: 'Select option type :',
            choices: [
                {name:"STRING",value:"3", description:"A plain text string"},
                {name:"INTEGER",value:"4", description:"A whole number (no decimals)"},
                {name:"BOOLEAN",value:"5", description:"A boolean (true or false)"},
                {name:"USER",value:"6", description:"A Discord user"},
                {name:"CHANNEL",value:"7", description:"A channel within the server"},
                {name:"ROLE",value:"8", description:"A role from the server"},
                {name:"MENTIONABLE",value:"9", description:"A user or role (mentionable)"}
            ]
        })

        const required  = await confirm({message:'This option is required ?'})

        options.push({
            name:name,
            description:description,
            type: Number(type),
            required:required
        })

        whantOpts = await confirm({message:'do you whant an other option ?'})
    }

    return options;
}