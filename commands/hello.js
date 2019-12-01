const Discord = module.require("discord.js");
const greetings = module.require('../data_arrays/greetings.js');

module.exports.run = async(OSRSBot, message, args) => {
  message.replytext = Math.floor(Math.random() * greetings.length);
  message.channel.send(`**` + greetings[message.replytext] + `** ${message.author}`);
}
module.exports.help = {
	name: "hello"
}
