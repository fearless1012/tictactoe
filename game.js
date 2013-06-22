var Quanta = ['O','X'];

//Winning Combinations
var WC = [
	[0,1,2],
	[3,4,5],
	[6,7,8],
	[0,3,6],
	[1,4,7],
	[2,5,8],
	[0,4,8],
	[2,4,6]];

var validateXY = function(x,y) {
	if('number' !== typeof x) return false;
	if('number' !== typeof y) return false;
	if(x>=0 && x<9 && y>=0 && y<9) return true;
	return false;
}
var Default = function(o,d) {
	return 'undefined' === typeof o ? d : o;
}

var Particle = function(type) {
	if(type !== 'quark') this.data = [];
	this.winner = -1;
	this.type = type;
}
Particle.prototype.isQuark = function() {
	return this.type === 'quark';
}
Particle.prototype.isEqual = function() {
	for(var i=1;i<arguments.length;i++)
		if(arguments[i] !== arguments[i-1])
			return false;
	return true;
}
Particle.prototype.isFull = function() {
	if(this.isQuark()) return this.winner !== -1;
	var subParticles = this.data, flag=true;
	for(var i=0;i<9;i++) {
		if(subParticles[i].winner === -1) flag = false;
	}
	return flag;
}
Particle.prototype.check = function(p) {
	if( 'number' === typeof this.winner &&
		this.winner !== -1 ) return this.winner;
	if(this.isQuark()) return this.winner===-1?false:this.winner;
	for(var i=0;i<WC.length;i++) {
		if(this.isEqual(p,
			this.data[WC[i][0]].winner,
			this.data[WC[i][1]].winner,
			this.data[WC[i][2]].winner )) {
			this.winner = this.data[WC[i][0]].winner;
			return this.winner;
		}
	}
	return false;
}
var game = function() {
	if( this instanceof arguments.callee ) {
		this.board = new Particle('board');
		for(var i=0;i<9;i++) {
			var hadron = new Particle('hadron');
			for(var j=0;j<9;j++) {
				hadron.data.push(new Particle('quark'));
			}
			this.board.data.push(hadron);
		}
	} else {
		return new arguments.callee(arguments);
	}
};
game.prototype.prev = -1;

// X always starts the game
// So previous player is O
game.prototype.pp = 0;

game.prototype.changePlayer = function() {
	if(this.pp === 0) this.pp = 1;
	else if(this.pp === 1) this.pp = 0;
	else console.log("This shouldn't Happen. Third player authorized.");
};
game.prototype.player = function() {
	if(this.pp === 0) return 1;
	else if(this.pp === 1) return 0;
	else console.log("This shouldn't happen. Third player authorized.");
};
game.prototype.nextHadron = function() {
	if(this.prev === -1) return -1;
	if(this.board.data[this.prev].isFull()) return -1;
	if(this.board.data[this.prev].winner !== -1) return -1;
	return this.prev;
}
game.prototype.setQuark = function(i,j,p,callback) {
	i = Default(i,-1),
	j = Default(j,-1),
	p = Default(p,-1),
	prev = Default(this.prev, -1);
	if(!validateXY(i,j)) return false;

	var hadron = this.board.data[i],
		quark = hadron.data[j];

	if(p===-1) return false;
	//if the current player is not playing
	if(this.player() !== p) return false;
	if(prev === -1) {
		//the opponent is allowed to choose anything
		if(hadron.winner !== -1) return false;
		if(quark.winner !== -1) return false;
	} else if(prev === i) {
		//the opponent has chosen the right hadron
		//if opponent fell into a conquered hadron
		if(hadron.winner !== -1) {
			return false;
			//if the hadron is full, an illegal request has come
			if(hadron.isFull()) return false;
			//so now it's not full
			if(quark.winner !== -1) return false;
		} else {
			if(quark.winner !== -1) return false;
		}
	} else {
		if(this.board.data[prev].isFull() || this.board.data[prev].winner !== -1) {
			if(hadron.winner !== -1){
				if(hadron.isFull()) return false;
				if(quark.winner !== -1) return false;
			} else {
				if(quark.winner !== -1) return false;
			}
		} else {
			//user has performed an illegal move
			return false;
		}
	}
	//legal move
	quark.winner = p;
	this.prev = j;
	this.changePlayer();

	var w = hadron.check(p);
	if(w !== false) {
		//notify that ith hadron is conquered by p
		if(w === p) {
			if('function' === typeof callback) callback.apply({
				type: 'hadron',
				winner: p,
				pos: i
			}, []);
		}
		else console.log("Should NOT have happened");
	}
	w = this.board.check(p);
	if(w !== false ) {
		if(w === p && 'function' === typeof callback) callback.apply({
			type: 'board',
			winner: p
		});
	}
	return true;
};
game.prototype.getState = function() {
	var state = {};
	var i,j;
	state.board = [];
	state.winner = this.board.winner;
	for(i=0;i<9;i++) {
		state.board.push(this.board.data[i].winner);
	}
	state.hadron = [];
	for(i=0;i<9;i++) {
		state.hadron[i] = [];
		for(j=0;j<9;j++) state.hadron[i].push(this.board.data[i].data[j].winner);
	}
	return state;
};

module.exports = game;
