const Discord = module.require("discord.js");

module.exports.run = async(OSRSBot, message, args) => {
	message.delete();
	mentionMessage = message.content.slice (8);
	message.author.send(`__**Here's the invite link for OSRS-Bestiary-Bot**__\r\n<https://discordapp.com/api/oauth2/authorize?client_id=631602888854077440&permissions=8&scope=bot>`);
}
module.exports.help = {
	name: "invite"
}
