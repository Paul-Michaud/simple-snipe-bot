//First discord bot, please be kind :3

const Discord = require("discord.js");
const Snipe = require("./Snipe.js");
const config = require("./config.test.json");
const client = new Discord.Client();
const prefix = config.prefix;

let botCommandChannel;
let boardChannel;
let adminChannel;

let snipe = new Snipe();


client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	botCommandChannel = client.channels.find(ch => ch.id === config.botCommandChannel);
	boardChannel = client.channels.find(ch => ch.id === config.boardChannel);
	adminChannel = client.channels.find(ch => ch.id === config.adminChannel);

	if (!botCommandChannel || !boardChannel || !adminChannel) return;

	client.user.setActivity('@Millionnnnnnn', { type: 'WATCHING' })
	  .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
	  .catch(console.error);
});

client.on("error", error => {
	console.log(error);
});

client.on("message", msg => {

	if ((msg.channel != botCommandChannel) && (msg.channel != adminChannel)) return;
	if (msg.author.bot) return;
	if (msg.channel.type === "dm") return;
	if (!msg.content.startsWith(prefix)) return;

	const args = msg.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	const user = "<@"+msg.author.id+">";

	if (command === "in") {
		if(args.length != 1) return;
		const digits = args[0].toLowerCase();
		console.log("Call : add("+digits+","+user+")");
		snipe.add(digits, user);
		refreshBoard(digits);
	} else if (command === "reset") {
		if (msg.channel != adminChannel) return;

		console.log("Reset");
		delete snipe;
		snipe = new Snipe();
		msg.channel.send("New snipe started.");
	} else	if (command === "stats") {
		if (msg.channel != adminChannel) return;

		let totalCaptains = 0;
		let nbOfLobby = 0;
		let nbOfGoodLobby = 0;
		let totalCaptainsInGoodLobby = 0;

		for(var game in snipe.games) {
			if(game == "Solo") {
				continue;
			} else {
				nbOfLobby++;
				totalCaptains+=snipe.games[game].players.length;
				if(snipe.games[game].players.length > 1) {
					nbOfGoodLobby++;
					totalCaptainsInGoodLobby+=snipe.games[game].players.length;
				}
			}
		}

		let averageTeam = (nbOfGoodLobby > 0 ? (totalCaptainsInGoodLobby / nbOfGoodLobby).toFixed(2) : 0);
		msg.channel.send("**Stats**\nTotal Lobby : " + nbOfLobby + "\nAverage teams (Not counting if only 1 captain) : " + averageTeam + "\nTotal captains " + totalCaptains);
	}
});


function refreshBoard(digits) {
	//If only 1 player in the slobby we put it in the "Solo" lobby and in his lobby byt we don't display his lobby yet
	
	if(snipe.games[digits].players.length == 1) {
		// Works because we expect only one player
		// Should be "for each" otherwise
		snipe.add("Solo", snipe.games[digits].players[0] + " (**" + digits + "**)");
		let playersSoloInLobby = getPlayerInLobbyString("Solo");
		const embedSolo = new Discord.RichEmbed()
		.setColor(0xC63B00)
		.addField("Solo captains", playersSoloInLobby, true);

		createOrEditLobbyMessage(digits, playersSoloInLobby);


	} else if (snipe.games[digits].players.length == 2) {
		snipe.remove("Solo", snipe.games[digits].players[0] + " (**" + digits + "**)");
		let playersSoloInLobby = getPlayerInLobbyString("Solo");

		const embedSolo = new Discord.RichEmbed()
		.setColor(0xC63B00)
		.addField("Solo captains", playersSoloInLobby, true);

		boardChannel.fetchMessages({around: snipe.games["Solo"].msgid, limit: 1}).then(messages => {
			messages.first().edit(embedSolo);
		});

		let playersInLobby = getPlayerInLobbyString(digits);

		const embed = new Discord.RichEmbed()
			.setColor(0xC63B00)
			.addField(digits + " ("+snipe.games[digits].players.length+"/25)", playersInLobby, true);

		createOrEditLobbyMessage(digits, embed);

	} else {

		let playersInLobby = getPlayerInLobbyString(digits);

		const embed = new Discord.RichEmbed()
			.setColor(0xC63B00)
			.addField(digits + " ("+snipe.games[digits].players.length+"/25)", playersInLobby, true);

		createOrEditLobbyMessage(digits, embed);
	
	}
}

function getPlayerInLobbyString(digits) {
	let playersInLobby = "";
	if(snipe.games[digits].players.length == 0) {
		playersInLobby = "No players";
	} else {
		for(var player in snipe.games[digits].players) {
			playersInLobby += snipe.games[digits].players[player] + " ";
		}
	}
	return playersInLobby;
}

function createOrEditLobbyMessage(digits, embed) {
	if(snipe.games[digits].msgid == null) {
		boardChannel.send(embed).then(sentMessage => snipe.games[digits].msgid = sentMessage.id);
	} else {
		boardChannel.fetchMessages({around: snipe.games[digits].msgid, limit: 1}).then(messages => {
			messages.first().edit(embed);
		});
	}
}

client.login(config.token);
