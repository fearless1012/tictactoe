var express = require('express'),
	routes = require('./routes'),
	user = require('./routes/user'),
	http = require('http'),
	path = require('path'),
	socketio = require('socket.io'),
	store = new express.session.MemoryStore();
	game = require('./game.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('blah blah blah'));
app.use(express.session({ 
	secret: 'Blah!Blah!Blah!123$5',
	store: store
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var g = new game();

console.log(g.setQuark(0,0,1));
console.log(g.setQuark(0,1,0));
console.log(g.setQuark(1,0,1));
console.log(g.setQuark(0,2,0));
console.log(g.setQuark(2,0,1));

console.log(g.setQuark(0,2,0));//cannot access already existing block
//so player stays the same
console.log(g.setQuark(0,3,0));
console.log(g.setQuark(0,3,1));
console.log(g.setQuark(3,3,1));

console.log(g.setQuark(3,0,0));
console.log(g.setQuark(0,4,1));
console.log(g.setQuark(4,0,0));
console.log(g.setQuark(0,5,1));
console.log(g.setQuark(5,0,0));
console.log(g.setQuark(0,6,1));
console.log(g.setQuark(6,0,0));
console.log(g.setQuark(0,7,1));
console.log(g.setQuark(7,0,0));
console.log(g.setQuark(0,8,1));
console.log(g.setQuark(8,0,0));
console.log(g.setQuark(1,1,1));

console.log(g.getState());

var server = http.createServer(app);
var io = socketio.listen(server);

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

