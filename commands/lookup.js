/**
  *
  * Author: William Klebe
  *
  * bestiary.js grabs the user defined string to search the OSRSWiki and return
  * mob/monster data to display into readable format.
  *
* */

const exists = require("url-exists");//NPM package
const cheerio = require("cheerio");//NPM package
const Discord = module.require("discord.js");

var request = require("request");//NPM package
var infoboxEntitiesTD = [];
var infoboxEntities = [];
var infoboxEntitiesTH = [];
var statMatch = new Array();
var multiMobStats = new Array();
var statMatch = [];
var formatMobStatsArray = new Array();
var setStatsArray = ['name', 'image', 'release', 'members', 'combat', 'examine',
                      'attributes', 'hitpoints', 'max hit', 'aggressive', 'poisonous',
                      'weakness', 'attack style', 'attack speed', 'slayxp','assignedby',
                      'att ', 'str','def',"mage",'range','astab','aslash', 'acrush', 'amagic',
                      'arange', 'dstab', 'dslash', 'dcrush', 'dmagic', 'drange', 'attbns', 'strbns',
                      'rngbns', 'mbns', 'immunepoison', 'immunevenom', 'twisted'];
var statDataArray = new Array();

module.exports.run = async (OSRSBot, message, args) => {

  let userQuery = args.join("_");
  const queryURL = 'https://oldschool.runescape.wiki/api.php?action=opensearch&search=' + userQuery + '&format=json&limit=5'
  var firstResultURL = '';
  var secondResultURL = '';
  var loadResult = [];//initial query
  var categoryArray = [];//page categories for validation.
  var isDisambig = true;//bool
  request(queryURL, function(error, response, webData) { //calls the searched term webpage data.
    lineBreak();
    console.log('error: ', error);
    console.log('statusCode: ', response && response.statusCode);
    console.log("file: " + webData);
    console.log(queryURL);
    lineBreak();
    var obj = JSON.parse(webData);
    loadResult.push(obj);
    firstResultURL = (loadResult[0][3][0]);
    console.log(firstResultURL);
    secondResultURL = (loadResult[0][3][1]);
    console.log(secondResultURL);
    if(firstResultURL == '' || loadResult[0][3][0] == undefined){
      return message.author.send("```Invalid search terms: " + args.join(`, `) + ". \nTry different key terms. Jad => Fight Caves```");
    }
    console.log("pre validateURL");
    var result = validateURL();
    console.log("Validated Link.");
    console.log("First Result URL" + firstResultURL);
    console.log("Second result URL" + secondResultURL);
    lineBreak();
  });

  function validateURL(){ //returns T/F, and sets secondResultURL to firstResultURL to avoid disambig page types.
      request(firstResultURL, function(error, response, html){//requests the first result from queryURL
        var $ = cheerio.load(html);
        $('.mw-normal-catlinks > ul > li').each(function(){//grabbing page categories.
          var catType = $(this).text();
          categoryArray.push(catType);//push to global array for usage later. (Might add on more.)
        });
        console.log('Original categories : ' + categoryArray);
        if(!categoryArray.includes('Disambiguation')){//if doesn't exist in categoryArray
          var i = firstResultURL;
          return isMob(i);
        } else if(categoryArray.includes('Disambiguation')){
          var i = firstResultURL = secondResultURL;
          request(i, function(error, response, html){//requests the first result from queryURL
            categoryArray.length = 0;
            var $ = cheerio.load(html);
            $('.mw-normal-catlinks > ul > li').each(function(){//grabbing page categories.
              var catType = $(this).text();
              categoryArray.push(catType);//push to global array for usage later. (Might add on more.)
            });
            console.log('New categories : ' + categoryArray);
            return isMob(i);
          });
        }
      });
  }

  function isMob(i){
    var tempStringArray = categoryArray.toString();
    console.log(tempStringArray);
    if(tempStringArray.includes('Monsters')){
      console.log("Page includes Monsters category.");
      return parseData(i);
    } else {
      console.log("Was not a monster.");
      return message.channel.send(`${message.author}: ` + i);
    }
  }

  function parseData(i){
    const getMobInfo = /Infobox Monster.+?(?=}})/;
    const regexMobStats = /[|].*?(?=\\n)/; //selects all valid stat data.
    const regexMobStats_V1 = /[|]+[a-z]+[^a-z2345].*?(?=\\n)/g;
    var urlLength = 'https://oldschool.runescape.wiki/w/'.length
    var redirectArgs = i.slice(urlLength);
    var lookupLink = 'https://oldschool.runescape.wiki/api.php?action=parse&prop=wikitext&format=json&page=';
    var redirectLookupLink = (lookupLink + redirectArgs);

    request(redirectLookupLink, function(error, response, body){
      console.log("Linked to : " + redirectLookupLink);
      var $ = cheerio.load(body).text();
      var data = $.match(getMobInfo);
      var monsterInfo_RAW = data[0];
      multiMobStats = monsterInfo_RAW.match(regexMobStats_V1);
      return OrganizeMobData(multiMobStats, data, monsterInfo_RAW);
    });
  }


  function OrganizeMobData(multiMobStats, data, monsterInfo_RAW){
    for (let g = 0; g < multiMobStats.length; g++){
      formatMobStatsArray.push((multiMobStats[g]).replace("|", ""));
    }
    return FilterAndRetrieveStats(formatMobStatsArray);
  }

  function FilterAndRetrieveStats(formatMobStatsArray){
    for (let i = 0; i < formatMobStatsArray.length; i++){ //removes all numerics and spaces from keys
      let vari = formatMobStatsArray.indexOf(formatMobStatsArray[i]);
      var value = formatMobStatsArray[i].split(" = ");
      let value1 = value[0].replace(" ", '').toString();
      let value2 = value[1].split(",");
      if (value1.match(/[a-z]+[1234567]/)){
        var temp = value1.slice(0, value1.length - 1);
        console.log("BOOM!");
        console.log(value1);
        console.log(formatMobStatsArray[i])
        formatMobStatsArray.splice(i, 1);
        i--
        value1 = temp;
        console.log(value1, value2);
      }
      statDataArray[value1] = value2
    }
    console.log(statDataArray);
    return discordEmbed(statDataArray);
  }

  function discordEmbed(statDataArray){

    const monsterStatsEmbed = new Discord.RichEmbed()
    .setColor('#0000ff')
    .setTitle(statDataArray['name'])
    .setURL(firstResultURL)
    .setAuthor('OSRS-WikiBot')
    .setThumbnail('https://oldschool.runescape.wiki/images/thumb/4/46/Old_School_RuneScape_Mobile_icon.png/120px-Old_School_RuneScape_Mobile_icon.png?6b7d1')
    .setDescription('**' + statDataArray['examine'] + '**' + "\n**Release date** " + statDataArray['release'])
    .addField('***Basic Info***',
      '\n__Combat Level__ | ' + statDataArray['combat'] +
      '\n__Members__ | ' + statDataArray['members'] +
      '\n__Twisted League__ | ' + statDataArray['twisted'] +
      '\n__Slayer XP__ | ' + statDataArray['slayxp'] +
      '\n__Assigned By__ | ' + statDataArray['assignedby'] +
      '\n__Immune Poison__ | ' + statDataArray['immunepoison'] +
      '\n__Immune Venom__ | ' + statDataArray['immunevenom'], true)
    .addField('***Combat Info***',
      '__Hitpoints__ | ' + statDataArray['hitpoints'] +
      '\n__Max hit__ | ' + statDataArray['maxhit'] +
      '\n__Aggressive__ | ' + statDataArray['aggressive'] +
      '\n__Poisonous__ | ' + statDataArray['poisonous'] +
      '\n__Weakness__ | ' + statDataArray['weakness'] +
      '\n__Attack style__ | ' + statDataArray['attackstyle'] +
      '\n__Attack speed__ | ' + statDataArray['attackspeed'], true)
    .addField('***Stat Bonuses***',
      '__Attack Bonus__ | ' + statDataArray['attbns'] + " " +
      '\n__Strength Bonus__ | ' + statDataArray['strbns'] + " " +
      '\n__Range Bonus__ | ' + statDataArray['rngbns'] + " " +
      '\n__Magic Bonus__ | ' + statDataArray['mbns'] + " ", true)
    .addField('***Combat Stats***',
      '__Attack__ | ' + statDataArray['att'] +
      '\n__Strength__ | ' + statDataArray['str'] +
      '\n__Defence__ | ' + statDataArray['def'] +
      '\n__Magic__ | ' + statDataArray['mage'] +
      '\n__Range__ | ' + statDataArray['range'], true)
    .addField('***Attack Stats***',
      '__Stab__ | ' + statDataArray['astab'] +
      '\n__Slash__ | ' + statDataArray['aslash'] +
      '\n__Crush__ | ' + statDataArray['acrush'] +
      '\n__Magic__ | ' + statDataArray['amagic'] +
      '\n__Range__ | ' + statDataArray['arange'], true)
    .addField('***Defense Stats***',
      '__Stab__ | ' + statDataArray['dstab'] +
      '\n__Slash__ | ' + statDataArray['dslash'] +
      '\n__Crush__ | ' + statDataArray['dcrush'] +
      '\n__Magic__ | ' + statDataArray['dmagic'] +
      '\n__Range__ | ' + statDataArray['drange'], true)
    .setTimestamp();
    message.channel.send(monsterStatsEmbed);
    statDataArray.length = 0;
  }
  function lineBreak(){
    console.log("--------------------------------------------------------------------");
  }
  selectorArray.length = 0;
  aboutStatSet.length = 0;
  combatinfoStatSet.length = 0;
  slayerinfoStatSet.length = 0;
  combatStatSet.length = 0;
  aggressiveStatSet.length = 0;
  defensiveStatSet.length = 0;
  multiMobStats.length = 0;
  statDataArray.length = 0;
  formatMobStatsArray.length = 0;
  monsterInfo_RAW.length = 0;
  categoryArray.length = 0;
  return;

}

module.exports.help = {
  name:"lookup"
}
