const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'premier-poll',
	data: new SlashCommandBuilder()
		.setName('premier-poll')
		.setDescription('Starts a new availability poll.')
		.setDMPermission(true)
		.addStringOption(option =>
			option.setName('map')
				.setDescription('The map of the current week.')
				.setRequired(true)
				.addChoices(
					{ name: 'Abyss', value: 'Abyss' },
					{ name: 'Ascent', value: 'Ascent' },
					{ name: 'Bind', value: 'Bind' },
					{ name: 'Breeze', value: 'Breeze' },
					{ name: 'Fracture', value: 'Fracture' },
					{ name: 'Haven', value: 'Haven' },
					{ name: 'Icebox', value: 'Icebox' },
					{ name: 'Pearl', value: 'Pearl' },
					{ name: 'Split', value: 'Split' },
					{ name: 'Sunset', value: 'Sunset' },
				)),
	async execute(interaction) {
		await interaction.deferReply();
	},
};