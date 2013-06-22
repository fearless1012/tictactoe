function randomString() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 8;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}

var Room = require('../room');
exports.index = function(req, res){
	res.render('home', { 
		title: 'Ultimate Tic Tac Toe',
		data: JSON.stringify(Room.getOverview()),
		rand: randomString()
	});
};
exports.gameboard = function(req, res) {
	if(!req.params['room']) return false;
	var name=req.params['room'];
	req.session.room = name;
	res.render('index', {
		title: "Ultimate Tic Tac Toe",
		sid: name
	})
};