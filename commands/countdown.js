const { SlashCommandBuilder } = require('@discordjs/builders');
const countdown = require('countdown');
const { EmbedBuilder } = require('discord.js');
const state = require('../state');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('countdown')
        .setDescription('Starts a countdown to a specific date and time.')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('The target date and time in the format yyyy.mm.dd-hh:mm:ss.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('image_url')
                .setDescription('The URL of the image to display.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('event_name')
                .setDescription('The name of the event to countdown to.')), // This is the new optional parameter
    async execute(interaction) {
        if (state.countdownActive) {
            await interaction.reply('A countdown is already active. Please remove the current countdown before starting a new one.');
            return;
        }

        const time = interaction.options.getString('time');
        const imageUrl = interaction.options.getString('image_url');
        const eventName = interaction.options.getString('event_name'); // Get the optional parameter

        const targetDate = new Date(time.replace(/(\d{4}).(\d{2}).(\d{2})-(\d{2}):(\d{2}):(\d{2})/, '$1/$2/$3 $4:$5:$6'));

        if (isNaN(targetDate.getTime())) {
            await interaction.reply('Invalid date and time format. Please use the format yyyy.mm.dd-hh:mm:ss.');
            return;
        }

        state.countdownActive = true;

        state.countdownInterval = setInterval(async () => {
            const timeLeft = countdown(targetDate, null, countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS);

            const embed = new EmbedBuilder()
                .setTitle(eventName ? `Countdown to ${eventName}` : 'Countdown')
                .setDescription('> **'+timeLeft.toString()+ '**')
                .setImage(imageUrl);

            try {
                if (!interaction.replied) {
                    await interaction.reply({ embeds: [embed], fetchReply: true });
                } else {
                    await interaction.editReply({ embeds: [embed] });
                }
            } catch (error) {
                console.error(error);
                clearInterval(state.countdownInterval);
                state.countdownActive = false;
                return;
            }

            if (new Date() >= targetDate) {
                clearInterval(state.countdownInterval);
                state.countdownActive = false;
            }
        }, 1000);
    },
};
