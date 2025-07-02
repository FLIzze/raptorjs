export const addCommandFunc = async () => {
    const commandName = "test"
    const description = "test description"
    
    const code = `\
export const PingCommand = {

    name:"${commandName}",
    description:"${description}",
    options:[],

    cmd : async (interaction) => {
        await interaction.reply('Pong!')
        logger.info(\`The ping command was used. The bot "\${interaction.client.user.username}" replied to the user "\${interaction.user.tag}".\`)
    }

}
    `
    console.log(code)
};