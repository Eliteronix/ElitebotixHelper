module.exports = async function (msg) {
	if (msg.content === '!log') {
		// eslint-disable-next-line no-console
		console.log(msg.client.reminderUsers);
	}

	if (msg.guildId === '727407178499096597') {
		await new Promise((resolve) => setTimeout(resolve, 5000));

		if (msg.channel.type === 5) { // Announcements
			try {
				await msg.crosspost();
			} catch (error) {
				console.error(error);
			}
		}
	}
};