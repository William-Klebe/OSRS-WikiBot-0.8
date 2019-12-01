/**
  *
  * Author: William Klebe
  *
  * bestiary.js grabs the user defined string to search the OSRSWiki and return
  * mob/monster data to display into readable format.
  *
* */

// const lineBreak = '-----------------------------------------------------------'
// const OSRSWiki = "https://oldschool.runescape.wiki/images/thumb/4/46/Old_School_RuneScape_Mobile_icon.png/240px-Old_School_RuneScape_Mobile_icon.png?6b7d1"
// var resultLinksArray = [];
// var categoryArray = [];
// var disambiguationResults = [];
// var pageDisambiguation = false;
// var finalReturnLink;
// var monsterInfo = [];
//
// console.log("result");
// console.log(result);
// console.log("categoryArray");
// console.log(categoryArray);
// console.log("finalReturnLink");
// console.log(finalReturnLink);


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
  console.log(selectorArray.length)
  aboutStatSet.length = 0;
  console.log(aboutStatSet.length)
  combatinfoStatSet.length = 0;
  console.log(combatinfoStatSet.length)
  slayerinfoStatSet.length = 0;
  console.log(slayerinfoStatSet.length)
  combatStatSet.length = 0;
  console.log(combatStatSet.length)
  aggressiveStatSet.length = 0;
  console.log(aggressiveStatSet.length)
  defensiveStatSet.length = 0;
  console.log(defensiveStatSet.length)
  multiMobStats.length = 0;
  console.log(multiMobStats.length)
  statDataArray.length = 0;
  console.log(statDataArray.length)
  formatMobStatsArray.length = 0;
  console.log(formatMobStatsArray.length)
  monsterInfo_RAW.length = 0;
  console.log(monsterInfo_RAW.length)
  categoryArray.length = 0;
  console.log(categoryArray.length)
  return;

  //Stuff I might use later.

  // for(var i = 0; i < 1; i++) { //Formats arguments for string matching.
  //   args[i] = args[i].charAt(0).toUpperCase() + args[i].substr(1);
  // }
  // console.log('Loading !lookup');
  // console.log(message.author.username + ` is looking up these key terms... "` + args.join('" "') + `"`); //returns url with searched terms
  // const url = `https://oldschool.runescape.wiki/w/Special:Search?search=` + args.join('+') + `&profile=default&fulltext=1&searchToken=bsd3igg05wty54wyfg3pfra8u`;
  // const errorMessage = "`" + args.join("` `") + "`: seemed to be incorrect search terms, if this is a bug, report it to `Lizardbutt#0377`, please."
  // const printOutArgs = args.join(" ");
  //
  // validateURL(url, function(err, exists){ //validatesURL
  //   if(!exists) {
  //     message.delete();
  //     message.author.send("The OSRS Wikipedia page must be down :(");
  //     console.log("\x1b[36m" + "Error message sent to user!!!" + "\x1b[0m");
  //     return;
  //   }
  //   console.log("Search page URL validated.\n");
  //   request({uri: url}, function(error, response, body){ //if URL exists, grab the first url.
  //     var loadedURL = cheerio.load(body);
  //     loadedURL(".mw-search-result-heading > a").each(function(){//Loads the url and grabs every loadedURL("ELEMENT");
  //       var link = loadedURL(this);
  //       var href = link.attr("href");
  //       var firstSearchResult = ("https://oldschool.runescape.wiki" + href);
  //       var resultLinksStringified = JSON.stringify(firstSearchResult);
  //       resultLinksArray.push(resultLinksStringified);
  //     });
  //     if (resultLinksArray.length == 0){
  //       message.author.send(errorMessage);
  //       console.log(lineBreak + "\nZero results returned.\nYEET\n" + lineBreak);
  //       return;
  //     }
  //     var selectedLinksArray = resultLinksArray[0].substring(1,((resultLinksArray[0].length)-1));
  //     const firstSelectedLink = resultLinksArray[0].substring(1,((resultLinksArray[0].length)-1));
  //     console.log(lineBreak);
  //     console.log(resultLinksArray);
  //     console.log(lineBreak + '\n         These were the arguments: ' + printOutArgs + '\n' +
  //                ("Compared to the firstSelectedLink: " + firstSelectedLink) + '\n' + lineBreak);
  //     // if(resultLinksArray === undefined || resultLinksArray == 0){
  //     //   message.delete();
  //     //   message.author.send(printOutArgs + errorMessage);
  //     //   console.log(message.author.username + " tried to search with invalid parameters!");
  //     //   return;
  //     // }
  //     if((!firstSelectedLink.includes(args[0] || args[1] || args[2])) && (!firstSelectedLink.includes(args[0].toLowerCase()))) {
  //       message.channel.send(message.author + ", is this what you were looking for? \n<" + firstSelectedLink + ">");
  //       console.log("Sent this link `" + firstSelectedLink + "` to " + message.author);
  //     } else if (selectedLinksArray == undefined){
  //         message.author.send(errorMessage);
  //         return;
  //     } else if (firstSelectedLink.includes(args[0] || args[1] || args[2])) { //check arguments to see if valid, continue on.
  //         validateURL(firstSelectedLink, function(err, exists){
  //           if(!exists){
  //             message.delete();
  //             message.author.send(errorMessage);
  //             return;
  //           } else if(exists) {
  //             console.log("Redirected URL has been validated o7");
  //               request({uri:firstSelectedLink}, function(error, response, html){ //request the URL if it exists.
  //                 var $ = cheerio.load(html);
  //                 console.log("Connection to firstSelectedLink complete\n" + lineBreak + "\nCategories as follows :");
  //                 $('.mw-normal-catlinks > ul > li').each(function(){//grabbing page category.
  //                   var catType = $(this).text();
  //                   categoryArray.push(catType);
  //                 });
  //                 console.log(categoryArray);
  //                 console.log(lineBreak);
  //                 if (categoryArray.includes("Disambiguation")){
  //                   pageDisambiguation = true;
  //                 } else {
  //                   pageDisambiguation = false;
  //                 }
  //                 if(!pageDisambiguation){
  //                   console.log("pageDisambiguation is false.");
  //                   finalReturnLink = firstSelectedLink;
  //                 } else if(pageDisambiguation){
  //                   console.log("pageDisambiguation is true.");
  //                   request({uri:firstSelectedLink}, function(error, response, html, ){ //request the URL if it exists.
  //                     var $ = cheerio.load(html);
  //                     console.log(lineBreak);
  //                     $('.mw-parser-output > ul > li > a').each(function(){//grabbing page category.
  //                       var disambigType = $(this).text();
  //                       disambiguationResults.push(disambigType);
  //                     });
  //                     console.log(disambiguationResults);
  //                     var redirectDisambig = ('https://oldschool.runescape.wiki/w/' + disambiguationResults[0].replace(/ /g,"_"));
  //                     finalReturnLink = firstSelectedLink;
  //                     console.log(finalReturnLink + ' page selection refined.');
  //                   });
  //                 }
  //                 request({uri:finalReturnLink}, function(error, response, html){
  //                   var $ = cheerio.load(html);
  //                   console.log(lineBreak);
  //                   $('.infobox-monster > tbody> tr').each(function(){
  //                     var infoboxEntities = $(this);
  //                     console.log(infoboxEntities);
  //                     monsterInfo.push(infoboxEntities);
  //                   });
  //                   const result = monsterInfo.filter(word => word.length > 0);
  //                   console.log("result");
  //                   console.log(result);
  //                   console.log("categoryArray");
  //                   console.log(categoryArray);
  //                   console.log("finalReturnLink");
  //                   console.log(finalReturnLink);
  //
  //                   //make a loop to iterate every element in array, only include if in predefined arrayCriteria. Add to array if exists.
  //
  //
  //
  //                   // if (categoryArray.includes("Slayer monsters")) {
  //                   //   // console.log("CONTAINS 'SLAYER MONSTER'");
  //                   //   // const testEmbed = new Discord.RichEmbed()
  //                   //   // .setColor('#0099ff')
  //                   //   // .setTitle(result.toString(result.find(result[0])) + ' (link)')
  //                   //   // .setURL(finalReturnLink)
  //                   //   // .setAuthor("OSRS-WikiBot", OSRSWiki)
  //                   //   // .setDescription(result[5].slice(7, result[5].length) + "\n" + result[1].slice(0,8) + ": " + result[1].slice(8,result[1].length-8))
  //                   //   // .setThumbnail(OSRSWiki)//needs to be the mob picture.
  //                   //   // .addField("Combat Info", result[3].slice(0,12) + ": " + result[3].slice(12,result[3].length) + "\n"
  //                   //   // + result[8].slice(0,9) + ": " +result[8].slice(9,result[8].length) + "\n"
  //                   //   // + result[9].slice(0,7) + ": " +result[9].slice(7,result[9].length) + "\n"
  //                   //   // + result[10].slice(0,10) + ": " +result[10].slice(10,result[10].length) + "\n" )
  //                   //   // .addBlankField()
  //                   //   // message.channel.send(testEmbed);
  //                   // } else if(categoryArray.includes("Monsters")) {
  //                   //   console.log("CONTAINS 'MONSTERS'");
  //                   // }
  //                   //filter out specific elements in the results array.
  //
  //
  //                 });
  //                 //     switch {
  //                 //       case: //SlayerMonsterPage
  //                 //         break;
  //                 //       case: //MonsterPage
  //                 //         break;
  //                 //       case: //EquipmentPage
  //                 //         break;
  //                 //       case: //ItemPage
  //                 //         break;
  //                 //       case: //NPCPage
  //                 //         break;
  //                 //       case: //EquipmentPage
  //                 //         break;
  //                 //     }
  //                 // }
  //             });
  //           }
  //         });
  //       }
  //   });
  // });
  // resultLinksArray.length = 0; //So array doesn't fill up when bot is running.
  // result.length = 0;
  // categoryArray.length = 0;
}

module.exports.help = {
  name:"lookup"
}
