var Room = function(name) {
	this.roomname = name;
	this.winner = -1;
	this.playX = -1;
	this.playO = -1;
	this.game = null;
}
Room.collection = {};
Room.getOverview = function() {
	var ret = [];
	for(var i in Room.collection) {
		if(Room.collection.hasOwnProperty(i)) {
			ret.push({
				name: Room.collection[i].roomname,
				winner: Room.collection[i].winner,
				isFull: Room.collection[i].isFull(),
			});
		}
	}
	return ret;
}
Room.addRoom = function(name) {
	Room.collection[name] = new Room(name);
}
Room.deleteRoom = function(name) {
	delete Room.collection[name];
}
Room.getRoom = function(name) {
	if('object' === typeof Room.collection[name])
		return Room.collection[name];
	return false;
}
Room.prototype.isComplete = function() {
	return this.winner !== -1;
}
Room.prototype.isFull = function() {
	return this.isX() && this.isO();
}
Room.prototype.isEmpty = function() {
	return this.playX === -1 && this.playO === -1;
}
Room.prototype.isX = function() {
	return this.playX !== -1;
}
Room.prototype.isO = function() {
	return this.playO !== -1;
}
Room.prototype.setWinner = function(w) {
	if(this.playX === w)
		this.winner = this.playX;
	else if(this.playO === w)
		this.winner = this.playO;
	else return false;
	return true;
}
Room.prototype.exists = function(sid) {
	if(this.playX === sid || this.playO === sid) return true;
	return false;
}
Room.prototype.addUser = function(sid) {
	if(this.isX()) {
		if(this.isO())
			return false;
		else
			this.playO = sid;
	} else {
		this.playX = sid;
	}
	return true;
}
Room.prototype.getPlayerCode = function(sid) {
	if(this.playX === sid) return 1;
	if(this.playO === sid) return 0;
	return -1;
}
Room.prototype.getUsers = function() {
	return [this.playX, this.playO];
}
Room.prototype.deleteUser = function(sid) {
	if(this.playX === sid) this.playX = -1;
	else if(this.playO === sid) this.playO = -1;
	else return false;
	return true;
}

module.exports = Room;