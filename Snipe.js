const Game = require("./Game.js");
class Snipe {

	constructor() {
		this.games = {};
		this.add("Solo", "->");
	}

	add(digits, player) {
		if(!this.games[digits]) {
			this.games[digits] = new Game(digits);
		}
		this.games[digits].addPlayer(player);
	}

	remove(digits, player) {
		//console.log("Call : Snipe.remove("+digits+","+player+")");
		if(this.games[digits]) {
			this.games[digits].removePlayer(player);
		}
	}
}

module.exports = Snipe;