var connect = require('express/node_modules/connect'),
	express = require('express'),
	cookie = require('cookie'),
	routes = require('./routes'),
	user = require('./routes/user'),
	http = require('http'),
	path = require('path'),
	socketio = require('socket.io'),
	store = new express.session.MemoryStore();
	game = require('./game.js'),
	Room = require('./room.js');

var SECRET = 'tic!tac!toe';

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(SECRET));
app.use(express.session({ 
	secret: SECRET,
	store: store,
	key: 'tictactoe.sid'
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.get('/', routes.index);
app.get('/users', user.list);

app.get('/:room', function(req, res) {
	if(!req.params['room']) return false;
	var name=req.params['room'];
	req.session.room = name;
	res.render('index', {
		title: "Ultimate Tic Tac Toe",
		sid: name
	})
});

var server = http.createServer(app),
	io = socketio.listen(server),
	parseCookie = connect.utils.parseSignedCookie;

io.set('log level', 2);

io.set('authorization', function (handshake, accept) {
	if (handshake.headers.cookie) {
		var cookieData = cookie.parse(handshake.headers.cookie);
		handshake.sessionID = parseCookie(cookieData['tictactoe.sid'], SECRET);
		store.get(handshake.sessionID, function(err, session) {
			if(err) return accept('Error in Session store', false);
			else if(!session) {
				return accept('Session NOT found', false);
			}
			handshake.session = session;
			//create Room if not exists
			var room = Room.getRoom(handshake.session.room);
			if(room === false) {
				Room.addRoom(handshake.session.room);
				room = Room.getRoom(handshake.session.room);
			}
			if(room.isFull()) return accept('Room is FULL', false);
			if(room.isComplete()) return accept('Game ended, Ask admin to delete', false);
			handshake.room = room;
			return accept(null,true);
		})
	} else {
		return accept('No cookie transmitted.', false);
	}
});

io.sockets.on('connection', function(socket) {
	var r = socket.handshake.session.room;
	var uid = socket.handshake.sessionID;
	var room = socket.handshake.room;
	room.addUser(uid);
	socket.join(r);
	if(room.game === null) room.game = new game();
	socket.on('disconnect', function() {
		room.deleteUser(uid);
	});
	socket.on('play', function(data) {
		if(room.game !== null) {
			var p = room.getPlayerCode(uid);
			if(p===-1) console.log("Shouldn't happen");
			var res = room.game.setQuark(data.i,data.j,p), flag = false;
			if(res)	flag = true;
			else flag = false;
			socket.get(r,function(err,dest){
				io.sockets.in(dest).emit('update',{
					status: flag,
					x: room.playX,
					o: room,playO,
					result: room.game.getState()
				});
			});
		}
	});
});

app.use(app.router);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});