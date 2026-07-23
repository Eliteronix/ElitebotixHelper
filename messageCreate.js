let userMessages = [];
const { dadMode, saveMe, vulgarWordsList } = require('./config.json');
const { gotDaded } = require('./stats.json');
const fs = require('fs');

module.exports = async function (msg) {
	//Bocatnical Garden
	if (msg.guildId === '727407178499096597') {
		await new Promise((resolve) => setTimeout(resolve, 5000));

		if (msg.channel.type === 5) { // Announcements
			try {
				await msg.crosspost();
			} catch (error) {
				if (error.message !== 'This message has already been crossposted.') {
					console.error(error);
				}
			}
		}
	}

	if (msg.author.bot) return;

	if (dadMode) {
		let message = msg.content.toLowerCase().replace('\'', '');
		if (message.startsWith('im ') || message.startsWith('i am ')) {
			message = message.replace('im ', '').replace('i am ', '');

			let gotDadedStats = gotDaded.find((gotDaded) => gotDaded.user === msg.author.id);

			let gotDadedString = '';

			if (gotDadedStats) {
				gotDadedStats.count += 1;

				gotDadedString = `*(GOTTEM x${gotDadedStats.count})*`;
			} else {
				gotDaded.push({
					user: msg.author.id,
					count: 1,
				});
			}

			fs.writeFileSync('./stats.json', JSON.stringify({ gotDaded }, null, 2));

			await msg.channel.send({ allowedMentions: {}, content: `Hi ${message}, I'm dad!` });
		}
	}

	//Bocatnical Garden
	if (msg.guildId === '727407178499096597') {

		if (saveMe) {
			let lyrics = [
				'I\'m trapped in a vile world',
				'Where the end game\'s all the same as every other',
				'We\'re only here to die',
			];

			if (msg.content === 'save me') {
				for (let lyric of lyrics) {
					await msg.channel.send({ content: lyric });
					await new Promise((resolve) => setTimeout(resolve, 2000));
				}
			} else if (msg.content === 'SAVE ME') {
				for (let lyric of lyrics) {
					await msg.channel.send({ content: lyric.toUpperCase() });
					await new Promise((resolve) => setTimeout(resolve, 2000));
				}
			}
		}

		// userMessages are checked to find out if a user is spamming
		let userMessage = userMessages.find((userMessage) => userMessage.user === msg.author.id && userMessage.message === msg.content);

		if (userMessage) {
			userMessage.lastMessage = new Date();
			userMessage.channels = [...new Set([...userMessage.channels, msg.channel.id])];

			if (userMessage.channels.length > 2) {
				// [Eliteronix, Terces]
				let userIdsToNotify = ['138273136285057025', '458196977939906562'];

				let usersToNotify = [];

				for (let userId of userIdsToNotify) {
					let user = await msg.client.users.fetch(userId);
					usersToNotify.push(user);
				}

				try {
					// Ban the user and delete messages for the last hour
					msg.member.ban({ deleteMessageSeconds: 60 * 60, reason: 'Spamming' })
						.then(() => {
							// Notify the users
							for (let user of usersToNotify) {
								user.send(`User <@${msg.author.id}> got banned for spamming \`${msg.content}\` in these channels: ${userMessage.channels.map((channel) => `<#${channel}>`).join(', ')}`);
							}
						})
						.catch((error) => {
							// Notify the users
							for (let user of usersToNotify) {
								user.send(`**FAILED TO BAN** user <@${msg.author.id}> for spamming \`${msg.content}\` in these channels: ${userMessage.channels.map((channel) => `<#${channel}>`).join(', ')}`);
							}

							console.error('Failed to ban', error);
						});
				} catch (error) {
					console.error('Failed to ban', error);
				}
			}
		} else {
			userMessages.push({
				lastMessage: new Date(),
				user: msg.author.id,
				message: msg.content,
				channels: [msg.channel.id],
			});
		}
	}

	//Sledding Silly Time!
	if (msg.guildId === '1501689641580105808') {
		if (msg.channel.id === '1529624316772094042') {
			let includesAWord = false;
			for (let i = 0; i < vulgarWordsList.length; i++) {
				if (msg.content.toLowerCase().includes(vulgarWordsList[i])) {
					includesAWord = true;
					break;
				}
			}

			if (!includesAWord) {
				await msg.delete();
			}
		}
	}

	// Only keep messages from the last hour
	userMessages = userMessages.filter((userMessage) => userMessage.lastMessage > new Date(Date.now() - 1000 * 60 * 60));

	if (msg.content === '!log') {
		// eslint-disable-next-line no-console
		console.log(msg.client.reminderUsers);
	}
};