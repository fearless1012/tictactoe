
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('home', { 
		title: 'Ultimate Tic Tac Toe',
		sid: req.sessionID
	});
};