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
Particle.prototype.check = function(p) {
	if( 'number' === typeof this.winner &&
		this.winner !== -1 ) return this.winner;
	if(this.isQuark()) return this.winner;
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

var validateXY = function(x,y) {
	if('number' !== typeof x) return false;
	if('number' !== typeof y) return false;
	if(x>=0 && x<9 && y>=0 && y<9) return true;
	return false;
}

game.prototype.setQuark = function(i,j,p,callback) {
	if(!validateXY(i,j)) return false;
	//check if ith hadron is already won
	var hadron = this.board.data[i];
	if(hadron.winner !== -1) return false;
	//check if it's already ticked
	var quark = hadron.data[j];
	if(quark.winner !== -1) return false;
	//conquer the quark //ensure p is obtained from session data
	quark.winner = p;
	//check if he won the hadron
	var w = hadron.check(p);
	if(w !== false) {
		//notify that ith hadron is conquered by p
		if(w === p)	callback.apply({
				type: hadron,
				winner: p,
				pos: i
			}, []);
		else console.log("Should NOT have happened");
	}

	this.board.check(p);
	return true;
}

game.prototype.getState = function() {
	var state = [];
	var i,j;
	for(i=0;i<9;i++) { 
		state[i] = [];
		for(j=0;j<9;j++) state[i].push(-1);
	}
	for(i=0;i<9;i++) {
		for(j=0;j<9;j++) {
			var y = Math.floor(j/3) + (i%3)*3;
			var x = Math.floor(i/3)*3 + (j%3);
			console.log(x,y);
			state[x][y] = this.board.data[i].data[j].winner;
		}
	}
	return state;
	var state2 = [];
	for(var i=0;i<9;i++) {
		state2[i] = [];
		var row = [];
		for(var j=0;j<9;j++) {
			//row.push(i+","+j);
			row.push(this.board.data[i].data[j].winner);
		}
		state2[i].push(row.slice(0,3));
		state2[i].push(row.slice(3,6));
		state2[i].push(row.slice(6,9));
	}
	return state2;
	var state3 = [];
	for(var i=0;i<3;i++) {
		state3[i] = [];
		state3[i].push(state2[Math.floor(i/3)*3]);
	}
	return state3;
};

game.prototype.set = function(x,y) {
	if(!validateXY(x,y)) return false;
}

module.exports = game;