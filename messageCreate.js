let userMessages = [];

module.exports = async function (msg) {
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

	if (msg.guildId === '727407178499096597') {
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

	// Only keep messages from the last hour
	userMessages = userMessages.filter((userMessage) => userMessage.lastMessage > new Date(Date.now() - 1000 * 60 * 60));

	if (msg.content === '!log') {
		// eslint-disable-next-line no-console
		console.log(msg.client.reminderUsers);
	}
};