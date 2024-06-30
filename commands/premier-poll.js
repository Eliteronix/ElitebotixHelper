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
		const map = interaction.options.getString('map');

		const poll = {
			question: `When can you play? | ${map}`,
			answers: [
				'(Scrim) Wednesday 7PM',
				'(Match) Thursday 7PM',
				'(Scrim) Friday 8PM',
				'(Match) Saturday 8PM',
				'(Match) Sunday 7PM',
			],
			duration: 192, // 8 days
			allow_multiselect: true,
			layout_type: 1,
		};
		const url = new URL(
			`https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}/callback`
		);

		const headers = {
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded',
		};

		await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify({ poll: poll }),
		}).then(async (response) => {
			let json = await response.json();

			console.log(json);
		});






















		// let response = await interaction.editReply({ poll: poll });

		// // Pin the poll
		// await interaction.channel.messages.fetch(response.id)
		// 	.then(message => message.pin())
		// 	.catch(console.error);
	},
};