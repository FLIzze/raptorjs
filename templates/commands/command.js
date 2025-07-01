export const command = {
    name: "COMMAND_NAME",
    description: "Description de la commande",
    usage: "/COMMAND_NAME [arguments]",
    category: "Général",
    permissions: [],
    cooldown: 3,
    
    async execute(interaction) {
        // Logique de la commande
        await interaction.reply("Order completed successfully!");
    }
};
