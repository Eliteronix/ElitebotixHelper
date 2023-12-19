module.exports = async function (msg) {
	if (msg.content === '!log') {
		// eslint-disable-next-line no-console
		console.log(msg.client.reminderUsers);
	}
};