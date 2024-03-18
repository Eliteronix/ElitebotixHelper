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
				// Message Eliteronix to notify about spam
				const user = await msg.client.users.fetch('138273136285057025');
				user.send(`User <@${msg.author.id}> is spamming in channels: ${userMessage.channels.map((channel) => `<#${channel}>`).join(', ')}`);
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