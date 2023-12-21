//require the config.json file
const config = require('./config.json');

//require the discord.js module
const Discord = require('discord.js');

module.exports = async function (reaction, user, client) {

	//Return if the bot reacted itself or if it was not a bot message
	if (user.id === client.user.id) {
		return;
	}

	if (reaction.message.channel.id !== config.reminderChannel) {
		return;
	}

	if (reaction.message.embeds.length === 0) {
		return;
	}

	for (let i = 0; i < client.reminderUsers.length; i++) {
		if (client.reminderUsers[i].id !== user.id) {
			continue;
		}

		// Set the user's next reminder
		let nextReminder = new Date();
		nextReminder.setUTCHours(nextReminder.getUTCHours() + config.remindAfterHours);

		client.reminderUsers[i] = { id: client.reminderUsers[i].id, nextReminder: nextReminder };
	}

	// Send the success message
	await reaction.message.channel.send(`${config.successMessage.replace('${user}', user.id)}`);

	// Delete the reminder message
	await reaction.message.delete();

	// Resend the reminder embeds
	const reminderChannel = client.channels.cache.get(config.reminderChannel);

	// Resend the reminder embeds
	let embed = new Discord.EmbedBuilder()
		.setColor('#0099ff')
		.setTitle('Click the button below to show you have taken care of your reminder!')
		.setTimestamp();

	let embedMessage = await reminderChannel.send({ embeds: [embed] });

	embedMessage.react('✅');

	// Delete old reminder messages
	const reminderMessageCollection = await reminderChannel.messages.fetch({ limit: 100 })
		.then(messages => messages.filter(m => m.author.id === client.user.id));

	reminderMessageCollection.forEach(async message => {
		if (message.content !== config.reminderMessage.replace('${user}', user.id)) {
			return;
		}

		await message.delete();
	});
};