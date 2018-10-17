class Game {

	constructor(digits) {
		this.digits = digits;
		this.players = [];
		this.msgid = null;
	}

	addPlayer(player) {
		//console.log("Call : Game.addPlayer("+player+")");
		if(!this.players.includes(player)) {
			this.players.push(player);
		}
	}

	removePlayer(player) {
		//console.log("Call : Game.removePlayer("+player+")");
		if(this.players.includes(player)) {
			var index = this.players.indexOf(player);
			if (index > -1) {
				this.players.splice(index, 1);
			}
		}
	}
}

module.exports = Game;