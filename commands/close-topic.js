const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'close-topic',
	data: new SlashCommandBuilder()
		.setName('close-topic')
		.setDescription('Closes the currently open topic.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		// Check if its the Elitebotix Topics Channel
		if (interaction.channel.parentId !== '1019637990844284959') {
			return interaction.editReply('This command can only be used in the Elitebotix Topics channel.');
		}

		// Fetch the elitebotix topics channel
		const elitebotixTopicsChannel = await interaction.client.channels.fetch('1019637990844284959');

		// Get the "Open" Tag ID
		let openTagId = elitebotixTopicsChannel.availableTags.find(t => t.name === 'Open').id;

		// Get the "Done" Tag ID
		let doneTagId = elitebotixTopicsChannel.availableTags.find(t => t.name === 'Done').id;

		// Remove the "Open" Tag from the thread and apply the "Done" Tag
		await interaction.channel.setAppliedTags([...new Set([doneTagId, ...interaction.channel.appliedTags.filter(tag => tag !== openTagId)])]);

		// Lock the thread
		await interaction.channel.setLocked(true);

		// Close the thread
		await interaction.channel.setArchived(true);

		await interaction.editReply('Topic closed successfully.');
	},
};