var express = require('express'),
	routes = require('./routes'),
	user = require('./routes/user'),
	http = require('http'),
	path = require('path'),
	socketio = require('socket.io'),
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
app.use(express.cookieParser('your secret here'));
app.use(express.session());
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
console.log(g.setQuark(1,0,1));
console.log(g.setQuark(1,4,1));
console.log(g.setQuark(0,0,0));
console.log(g.setQuark(1,8,1));
console.log(g.getState());

// var server = http.createServer(app);
// var io = socketio.listen(server);
// 
// server.listen(app.get('port'), function(){
//   console.log('Express server listening on port ' + app.get('port'));
// });

