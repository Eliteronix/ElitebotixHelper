const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { gotDaded } = require('../stats.json');
const { leaderboardEntriesPerPage } = require('../config.json');
const { createLeaderboard } = require('../utils.js');

module.exports = {
	name: 'dad-leaderboard',
	data: new SlashCommandBuilder()
		.setName('dad-leaderboard')
		.setDescription('Displays the leaderboard of users who have been gotten the most.')
		.setDMPermission(false)
		.addIntegerOption(option =>
			option.setName('page')
				.setDescription('The page of the leaderboard to display.')
				.setRequired(false)
				.setMinValue(1)
		),
	async execute(interaction) {
		await interaction.deferReply();

		let leaderboardData = [];

		try {
			let members = await interaction.guild.members.fetch({ time: 300000 });

			members = members.map(member => member);

			for (let i = 0; i < members.length; i++) {
				let userDisplayName = `${members[i].user.username}`;

				if (members[i].nickname) {
					userDisplayName = `${members[i].nickname} / ${userDisplayName}`;
				}

				let gotDadedStats = gotDaded.find((gotDaded) => gotDaded.user === members[i].user.id);

				if (gotDadedStats) {
					let dataset = {
						name: userDisplayName,
						value: `${gotDadedStats.count} times`,
						color: members[i].displayHexColor,
						sortValue: gotDadedStats.count,
						userId: members[i].id,
					};

					leaderboardData.push(dataset);
				}
			}
		} catch (e) {
			if (e.message !== 'Members didn\'t arrive in time.') {
				console.error('commands/dad-leaderboard.js | Get members', e);
				return;
			}
		}

		leaderboardData.sort((a, b) => b.sortValue - a.sortValue);

		let messageToAuthor = '';
		let authorPlacement = 0;

		for (let i = 0; i < leaderboardData.length; i++) {
			if (interaction.user.id === leaderboardData[i].userId) {
				messageToAuthor = `\nYou are currently rank \`#${i + 1}\` on the leaderboard.`;
				authorPlacement = i + 1;
			}
		}

		let totalPages = Math.floor(leaderboardData.length / leaderboardEntriesPerPage) + 1;

		let page = interaction.options.getInteger('page');

		if (!page && leaderboardData.length > 150) {
			page = 1;
			if (authorPlacement) {
				page = Math.floor(authorPlacement / leaderboardEntriesPerPage) + 1;
			}
		}

		if (totalPages === 1) {
			page = null;
		}

		let filename = `guild-leaderboard-${interaction.user.id}-${interaction.guild.name}.png`;
		if (page) {
			filename = `guild-leaderboard-${interaction.user.id}-${interaction.guild.name}-page${page}.png`;
		}

		//Remove trailing s if guild name stops with s or x
		let title = `${interaction.guild.name}'s dad leaderboard`;
		if (interaction.guild.name.endsWith('s') || interaction.guild.name.endsWith('x')) {
			title = `${interaction.guild.name}' dad leaderboard`;
		}

		const attachment = await createLeaderboard(leaderboardData, title, filename, page);

		//Send attachment
		await interaction.followUp({ content: `The leaderboard shows the most active users of the server.${messageToAuthor}`, files: [attachment] });
	},
};