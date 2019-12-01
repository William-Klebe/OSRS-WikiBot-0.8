const Discord = module.require("discord.js");
const whatSkill = module.require('../data_arrays/whatSkill.js');

module.exports.run = async (OSRSBot, message, args) => {
	message.replytext = Math.floor(Math.random() * whatSkill.length);
	message.channel.send(`${message.author} **` + whatSkill[message.replytext] + `**`);
}

module.exports.help = {
	name: "roll"
}