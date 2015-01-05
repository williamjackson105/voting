
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var player = require('./routes/player')
var user = require('./routes/user')
var http = require('http');
var path = require('path');
var mongo = require('mongodb');
var monk = require('monk');

var db = monk('localhost:27017/myplayers');
//var db = monk('ds061558.mongolab.com:61558/myplayers', {username:'nodejitsu_shyamrock', password:'vietm8muadrntdaces5gusnvn7' });

var security = require('./routes/security');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.urlencoded());
app.use(express.cookieParser('constricting snakes mix cocktails')); // do not change this!
app.use(express.methodOverride());
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.playerlist(db));
app.get('/players', player.list);
app.get('/helloworld', routes.helloworld);

app.get('/playerlist', routes.playerlist(db));

app.get('/newplayer', routes.newplayer);
app.post('/addplayer', routes.addplayer(db));

app.get('/users', user.list);
app.get('/userlist', routes.userlist(db));
/*app.get('/newuser', routes.newuser);
app.post('/adduser', routes.adduser(db));

app.post('/login', security.login(db));
app.get('/logout', security.logout());*/

server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);
/*
io.configure(function(){
	io.set('log level', 0);

	io.set('authorization', function(data, callback) {
		if (data.headers.cookie) {
			var cookie = cookieParser.parse(data.headers.cookie);
			//sessionMongoStore.get(cookie['connect.sid'], function(err, session) {
			sessionStore.get(cookie['connect.sid'], function(err, session) {
				if (err || !session) {
					callback('Error', false);
				} else {
					data.session = session;
					callback(null, true);
				}
			});
		} else {
			callback('No cookie', false);
		}
	});
});*/

io.sockets.on('connection', function (socket) {

	socket.on('get-players-on-leader-board', function (data) {

		var collection = db.get('playercollection');

		collection.find({},{'limit':10, 'sort': {'vote':-1} },function(e,docs){			
			socket.emit('updateleaderboard', {playerlist: docs} );
		});		
	});

	socket.on('get-players-by-page', function (data) {
		var page	 = data.page;
		var collection = db.get('playercollection');

		collection.find({},{'limit':9, 'skip':page*9, 'sort': {'vote':-1 }},function(e,docs){			
			socket.emit('updateplayerlist', {pagenum:page, playerlist: docs} );
		});		
	});

	socket.on('update-vote', function (data) {
			
		//{playername: player, vote: vote, ip: myip, today:today}

		var playercollection = db.get('playercollection');
		var usercollection = db.get('usercollection');

		usercollection.find({"ip": data.ip, "votedate": data.today, "player":data.playername},{},function(e,docs){	
					
			if (docs.length == 0)
			{
				usercollection.insert({
					"ip" : data.ip,
					"votedate" : data.today,
					"player": data.playername
				});

				playercollection.find({"name": data.playername},{},function(e,docs){	
					playercollection.update({ "name": data.playername }, { "name": data.playername, "url": docs[0].url, "vote": data.vote+1 });
				});

				console.log("new ip : "+data.ip + "," + data.today);
				socket.emit('checkedvote', {'name': data.playername,'updated': 1}) ;				
			} else {
				console.log("new ip : "+docs[0].ip + "," + docs[0].votedate + "," + docs[0].player);
				socket.emit('checkedvote', {'name': data.playername,'updated': 0}) ;		
			}
		});

	});
});

