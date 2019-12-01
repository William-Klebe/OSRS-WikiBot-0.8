const Discord = module.require("discord.js");
var commandList = module.require('../data_arrays/commands.js');

module.exports.run = async(bot, message, args) => {
	message.delete();
	mentionMessage = message.content.slice (8);
	message.author.send(`${commandList}`);
}
module.exports.help = {
	name: "help"
}
