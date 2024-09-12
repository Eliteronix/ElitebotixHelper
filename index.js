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
			commandJson.integration_types = [1];
			commandJson.contexts = [2];

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
	updateElitebotixTopics();
}

client.on('messageCreate', messageCreate);

client.on('voiceStateUpdate', voiceStateUpdate);

client.on('interactionCreate', interactionCreate);

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