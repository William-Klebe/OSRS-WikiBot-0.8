const Discord = module.require("discord.js");

module.exports.run = async(bot, message, args) => {
	message.author.send(`${message.author} You'd like to donate?! Thank you!\r\n https://paypal.me/Lizardbutt?locale.x=en_US`);
}
module.exports.help = {
	name: "donate"
}
