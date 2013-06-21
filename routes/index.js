var Room = require('../room');
exports.index = function(req, res){
	res.render('home', { 
		title: 'Ultimate Tic Tac Toe',
		data: JSON.stringify(Room.getOverview())
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