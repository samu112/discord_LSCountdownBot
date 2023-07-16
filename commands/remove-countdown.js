const { SlashCommandBuilder } = require('@discordjs/builders');
const state = require('../state');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-countdown')
        .setDescription('Removes the current countdown.'),
    async execute(interaction) {
        if (!state.countdownActive) {
            await interaction.reply('There is no active countdown to remove.');
            return;
        }

        clearInterval(state.countdownInterval);
        state.countdownActive = false;

        await interaction.reply('The countdown has been removed.');
    },
};
