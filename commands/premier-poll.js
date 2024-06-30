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
			question: {
				text: `When can you play? | ${map}`
			},
			answers: [
				{
					answer_id: 1,
					poll_media: {
						text: '(Scrim) Wednesday 7PM'
					}
				},
				{
					answer_id: 2,
					poll_media: {
						text: '(Match) Thursday 7PM'
					}
				},
				{
					answer_id: 3,
					poll_media: {
						text: '(Scrim) Friday 8PM'
					}
				},
				{
					answer_id: 4,
					poll_media: {
						text: '(Match) Saturday 8PM'
					}
				},
				{
					answer_id: 5,
					poll_media: {
						text: '(Match) Sunday 7PM'
					}
				},
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
			'Content-Type': 'application/json'
		};

		await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				'type': 4,
				'data': {
					poll: poll
				}
			}),
		});
	},
};