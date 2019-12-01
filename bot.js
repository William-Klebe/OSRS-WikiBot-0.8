//constants
const botSettings = require("./botsettings.json");
const Discord = require('discord.js');
const fs = require("fs");
const welcomeMessage = require('./data_arrays/joinMessage.js');
const pushCommandsList = require('./data_arrays/commands.js');
const prefix = botSettings.prefix;
//botActivity
var currentActivity = require('./data_arrays/activities.js');
//For cooldown timer.
let cooldown = new Set();
let cdSeconds = 5;

//SPAGHETTI EVERYWHERE. I'll clean it up later.

const OSRSBot = new Discord.Client({disableEveryone: true});
OSRSBot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => { //grabs commandList
  let jsfiles = files.filter(f =>f.split(".").pop() === "js");
  if(jsfiles.length <= 0){ //if no commandList
    console.log("Out of commands");
    return;
  }
  console.log(`Loading ${jsfiles.length} commands . . .`); //this displays all commands that are loaded in the start.bat
  jsfiles.forEach((f, i) => {
    let props = require(`./commands/${f}`);
    console.log(`${i + 1}: ${f} loaded.`);
    OSRSBot.commands.set(props.help.name, props);
  });
});
OSRSBot.on("ready", async() => { //on ready do all these.
  console.log("\x1b[44mReady to meme. YEET\r\x1b[0m"); //YEETUS
  console.log(OSRSBot.commands);//logs all commands
  botActivity = Math.floor((Math.random() * currentActivity.length) + 0);//Grabs random activity
  OSRSBot.user.setActivity(currentActivity[botActivity]);//Displays random activity
});
OSRSBot.on("message", async message => { //Messaging handler
  if(message.author.bot) return; //prevents bot from looping commands, exploit preventer.
  // if(cooldown.has(message.author.id)){
  //   message.delete();
  //   return message.author.send(`${message.author}, You need to wait 5 seconds between commands`);
  // } cooldown.add(message.author.id);
  let messageArray = message.content.split(/ +/);
  let command = messageArray[0];
  let args = messageArray.slice(1);
  let command_format = OSRSBot.commands.get(command.slice(prefix.length));
  if(message.author.bot || message.channel.type === "dm") return; //prevents bot from looping commands, exploit preventer. or accepts DM commands
  else { //chat logger.
    console.log(`ClientID:` + message.author + ` ` +
    `GuildID:` + message.guild.id + ` ` +
    `ChannelID:` + message.channel.id + `\r\n` +
    `MessageInfo: ` + message.guild.name + `-` + message.author.username + `-` + message.channel.name +
    `- MessageContent:"` + message.content + `"`);
  }
  if(!message.content.startsWith(prefix) || (message.author.bot)) return; //if message does not start with prefix, or author is bot, return.
  if(command_format) await command_format.run(OSRSBot, message, args);
  // if author has a cooldown, delete their message and send DM with warning.
  //apply cooldown
  // setTimeout(() => {
  //   cooldown.delete(message.author.id)
  // }, cdSeconds * 1000); return;
});

OSRSBot.on("guildMemberAdd", member => { //Welcome message for new members
  let guild = member.guild;
  let memberTag = member.user.tag;
  if(guild.systemChannel){
    const joinMessage = ["Welcome " + member + ", lord of the flies",
                        "Welcome " + member + ", the legend!",
                        member + " is here!",
                        "Run! " + member + " is here!",
                        "By your powers combined, is " + member,
                        "Shhhh, " + member + " is here stop talking about them."];
    var welcomeMessage_Random = Math.floor((Math.random() * joinMessage.length) + 0);
    guild.systemChannel.send(joinMessage[welcomeMessage_Random]);
    member.send(pushCommandsList);
    console.log(`${member.user.username} ` + member.id + ` has joined ` + guild.name + ` ` + guild.id);
  }
})

OSRSBot.login(botSettings.token);
