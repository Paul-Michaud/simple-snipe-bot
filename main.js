const Discord = require("discord.js");
const Snipe = require("./Snipe.js");
const config = require("./config.json.test");
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

});

client.on("error", error => {
	console.log(error);
});

client.on("message", msg => {

	if (!adminChannel) {
		//console.log("The Admin channel does not exist");
	}

	if ((msg.channel != botCommandChannel) && (msg.channel != adminChannel)) {
	//console.log("Only listen to specified channel");
		return;
	}

	if (msg.author.bot) {
		//console.log("Ignore bots.");
		return;
	}

	if (msg.channel.type === "dm") {
		//console.log("Ignore DM channels.");
		return;
	}

	if (!msg.content.startsWith(prefix)) {
		//console.log("Message doesn't start with prefix");
		return;
	}

	const args = msg.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	const user = "<@"+msg.author.id+">";

	if (command === "in") {
		if(args.length != 1) return;
		const digits = args[0].toLowerCase();
		console.log("Call : add("+digits+","+user+")");
		snipe.add(digits, user);
		refreshBoard(digits);
	} else
	if (command === "remove") {
		if(args.length != 1) return;
		const digits = args[0];
		console.log("Call : remove("+digits+","+user+")");
		snipe.remove(digits, user);
		refreshBoard(digits);
	} else
	if (command === "reset") {
		if (msg.channel != adminChannel) {
			//console.log("Only listen to admin channel");
			return;
		}
		console.log("Reset");
		delete snipe;
		snipe = new Snipe();
		msg.channel.send("New snipe started.");
	} else
	if (command === "stats") {
		if (msg.channel != adminChannel) {
			//console.log("Only listen to admin channel");
			return;
		}
		let totalCaptains = 0;
		// good lobby = more than 1 captain
		let nbOfGoodLobby = 0;
		for(var game in snipe.games) {
			totalCaptains+=snipe.games[game].players.length;
			if(snipe.games[game].players.length > 1) nbOfGoodLobby++;
		}

		let nbOfLobby = Object.keys(snipe.games).length;
		let averageTeam = (totalCaptains / nbOfGoodLobby).toFixed(2);
		msg.channel.send("**Stats**\nTotal Lobby : " + nbOfLobby + "\nAverage teams (Not counting if only 1 captain) : " + averageTeam + "\nTotal captains " + totalCaptains);
	}
});


function refreshBoard(digits) {
	//Si dans ce digit juste 1 joueur je mets dans le message/game solo

	//Sinon 
		//Je supprime le joueur du message/game solo et je créé le message avec deux captains
	
	let playersInLobby = "";
	if(snipe.games[digits].players.length == 0) {
		playersInLobby = "No players";
	} else {
		for(var player in snipe.games[digits].players) {
			playersInLobby += snipe.games[digits].players[player] + " ";
		}
	}

	const embed = new Discord.RichEmbed()
		.setColor(0xC63B00)
		.addField(digits + " ("+snipe.games[digits].players.length+"/25)", playersInLobby, true);

	if(snipe.games[digits].msgid == null) {
		boardChannel.send({embed}).then(sentMessage => snipe.games[digits].msgid = sentMessage.id);
	}
	else {
		boardChannel.fetchMessages({around: snipe.games[digits].msgid, limit: 1})
			.then(messages => {
				messages.first().edit(embed);
			});
	}
}

client.login(config.token);

