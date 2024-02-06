module.exports = async function (oldMember, newMember) {
	if (newMember.channelId === '1174867320921927773' && oldMember.channelId !== '1174867320921927773') {
		// Move the member to 1187970522827468910 after 1.5 hours and back to 1174867320921927773 after 2 hours
		let timeout = 1000 * 60 * 60 * 1.75;

		setTimeout(async () => {
			// Check if the member is still in the voice channel
			// Fetch the voiceState of the member
			const voiceState = newMember.guild.voiceStates.cache.get(newMember.id);

			if (!voiceState) {
				return;
			}

			// Check if the member is still in the voice channel
			if (voiceState.channelId !== '1174867320921927773') {
				return;
			}

			newMember.setChannel('1187970522827468910');

			// Wait for 3 seconds
			await new Promise(resolve => setTimeout(resolve, 1000 * 3));

			newMember.setChannel('1174867320921927773');
		}, timeout);
	}
};