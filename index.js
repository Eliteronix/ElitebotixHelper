//Log message upon starting the bot
// eslint-disable-next-line no-console
console.log('Bot is starting...');

require('dotenv').config();

//require the discord.js module
const Discord = require('discord.js');

//require the config.json file
const config = require('./config.json');

//create a Discord client with discord.js
const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildMessageReactions,
		Discord.GatewayIntentBits.DirectMessages,
		Discord.GatewayIntentBits.DirectMessageReactions,
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.GuildVoiceStates,
	],
	partials: [
		Discord.Partials.Message,
		Discord.Partials.Reaction,
		Discord.Partials.Channel,
	]
});

const messageCreate = require('./messageCreate');
const reactionAdded = require('./reactionAdded');
const voiceStateUpdate = require('./voiceStateUpdate');
const interactionCreate = require('./interactionCreate');

//login with the Discord client using the Token from the .env file
// eslint-disable-next-line no-undef
client.login(process.env.BOTTOKEN);

//declare what the discord client should do when it's ready
client.on('ready', readyDiscord);

client.reminderUsers = config.remindees;

//declare the function which will be used when ready
async function readyDiscord() {
	//log a message when ready
	// eslint-disable-next-line no-console
	console.log('The Bot is ready.');

	client.user.setPresence({
		status: 'online',  //You can show online, idle....
		activities: [{
			name: 'with Elitebotix',  //The message shown
			// type: 'PLAYING' //PLAYING: WATCHING: LISTENING: STREAMING:
		}]
	});

	const { REST, Routes } = require('discord.js');
	const fs = require('node:fs');

	const commands = [];
	// Grab all the command files from the commands directory you created earlier
	const commandFiles = fs.readdirSync('./commands');

	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		if (!file.endsWith('.js')) {
			continue;
		}

		const command = require(`./commands/${file}`);

		if (command.name === 'premier-poll') {
			let commandJson = command.data.toJSON();
			commandJson.integration_types = 1;

			console.log(commandJson);

			commands.push(commandJson);
		} else {
			commands.push(command.data.toJSON());
		}
	}

	// eslint-disable-next-line no-undef
	const rest = new REST({ version: '10' }).setToken(process.env.BOTTOKEN);

	(async () => {
		let notDone = true;
		while (notDone) {
			try {
				// eslint-disable-next-line no-console
				console.log(`Started refreshing ${commands.length} application (/) commands.`);

				const data = await rest.put(
					Routes.applicationCommands(client.user.id),
					{ body: commands },
				);

				// eslint-disable-next-line no-console
				console.log(`Successfully reloaded ${data.length} application (/) commands.`);

				client.slashCommandData = data;
				notDone = false;
			} catch (error) {
				console.error('bot.js | Set application commands' + error);
			}
		}
	})();

	// Get the channel to send reminders to
	const reminderChannel = await client.channels.fetch(config.reminderChannel);

	// Get the most recent messages sent by the bot
	const reminderMessageCollection = await reminderChannel.messages.fetch({ limit: 100 })
		.then(messages => messages.filter(m => m.author.id === client.user.id));

	// Convert the message collection to an array
	const reminderMessages = Array.from(reminderMessageCollection.values());

	for (let i = 0; i < client.reminderUsers.length; i++) {
		// Get the user's most recent reminder
		const userMessages = reminderMessages.filter(m => m.content.includes(client.reminderUsers[i]));

		// If the user hasn't had a reminder yet
		if (!userMessages.length) {
			client.reminderUsers[i] = { id: client.reminderUsers[i], nextReminder: new Date() };
			continue;
		}

		// Get the date of the user's next reminder
		// Sort the reminder message by date and get the last one
		const mostRecentMessage = userMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

		// Set the user's next reminder based on the last message
		// If the last message was a success message, set the next reminder to the regular interval
		if (mostRecentMessage.content === config.successMessage.replace('${user}', client.reminderUsers[i])) {
			let nextReminder = new Date(mostRecentMessage.createdAt);
			nextReminder.setUTCHours(nextReminder.getUTCHours() + config.remindAfterHours);

			client.reminderUsers[i] = { id: client.reminderUsers[i], nextReminder: nextReminder };
			continue;
		}

		// If the last message was a reminder message, set the next reminder to the repeat interval
		let nextReminder = new Date(mostRecentMessage.createdAt);
		nextReminder.setUTCHours(nextReminder.getUTCHours() + config.repeatAfterHours);

		client.reminderUsers[i] = { id: client.reminderUsers[i], nextReminder: nextReminder };
	}

	checkReminders();
	updateElitebotixTopics();
}

client.on('messageReactionAdd', (reaction, user) => {
	reactionAdded(reaction, user, client);
});

client.on('messageCreate', messageCreate);

client.on('voiceStateUpdate', voiceStateUpdate);

client.on('interactionCreate', interactionCreate);

async function checkReminders() {
	// Get the due reminders
	const dueReminders = client.reminderUsers.filter(u => u.nextReminder <= new Date());

	if (!dueReminders.length) {
		setTimeout(checkReminders, 1000 * 60);
		return;
	}

	// Get the channel to send reminders to
	const reminderChannel = client.channels.cache.get(config.reminderChannel);

	for (let i = 0; i < client.reminderUsers.length; i++) {
		if (client.reminderUsers[i].nextReminder > new Date()) {
			continue;
		}

		// Send the reminder
		reminderChannel.send(`${config.reminderMessage.replace('${user}', client.reminderUsers[i].id)}`);

		// Set the user's next reminder
		let nextReminder = new Date();
		nextReminder.setUTCHours(nextReminder.getUTCHours() + config.repeatAfterHours);

		client.reminderUsers[i] = { id: client.reminderUsers[i].id, nextReminder: nextReminder };

		// Get the most recent messages sent by the bot that includes an embed
		const reminderEmbedMessageCollection = await reminderChannel.messages.fetch({ limit: 100 })
			.then(messages => messages.filter(m => m.author.id === client.user.id && m.embeds.length > 0));

		// Delete old reminder messages
		reminderEmbedMessageCollection.forEach(async message => {
			await message.delete();
		});
	}

	// Resend the reminder embeds
	let embed = new Discord.EmbedBuilder()
		.setColor('#0099ff')
		.setTitle('Click the button below to show you have taken care of your reminder!')
		.setTimestamp();

	let embedMessage = await reminderChannel.send({ embeds: [embed] });

	embedMessage.react('✅');

	setTimeout(checkReminders, 1000 * 60);
}

async function updateElitebotixTopics() {
	// Fetch the elitebotix topics channel
	const elitebotixTopicsChannel = await client.channels.fetch('1019637990844284959');

	// Fetch all the threads in the channel
	await elitebotixTopicsChannel.threads.fetchArchived({ limit: 100 });

	let doneTagId = elitebotixTopicsChannel.availableTags.find(t => t.name === 'Done').id;

	// Filter out the threads that have the "Done" Tag applied
	let openTopics = elitebotixTopicsChannel.threads.cache.filter(t => !t.appliedTags.includes(doneTagId));

	// Apply the "Open" Tag to the threads that don't have the "Done" Tag

	// Get the "Open" Tag ID
	let openTagId = elitebotixTopicsChannel.availableTags.find(t => t.name === 'Open').id;

	// Apply the "Open" Tag to the threads that don't have the "Done" Tag
	openTopics.forEach(async thread => {
		if (thread.archived) {
			await thread.setArchived(false);
		}

		if (!thread.appliedTags.includes(openTagId)) {
			await thread.setAppliedTags([openTagId, ...thread.appliedTags]);
		}
	});

	setTimeout(updateElitebotixTopics, 1000 * 60);
}