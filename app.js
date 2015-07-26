var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Insta = require('instagram-node-lib');
var Twit = require('twit');

var callback_url = 'https://wsvbgzitzs.localtunnel.me' + '/callback';
var hashtag = 'blacklivesmatter';

app.get('/', function (req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function (req, res){
  res.sendFile(__dirname + '/style.css');
});

// Twitter
var T = new Twit({
  consumer_key: 'OUNYdxeZww9NDxQQCJMUpzHKQ',
  consumer_secret: 'ikBPgMtA8XYMZ5brDjmmCvo3et5kKT9akw7Q41Ejgs6J3rfG4f',
  access_token: '201589912-eGOp8qWQjyyxC9WDLWngdh8hlGKIuvHbxmoK7VPL',
  access_token_secret: 'yZ5nRiMNbd2lDzCe4W59ZzyAHc9VXMx5zmwIs489mWB8C'
});

var stream = T.stream('statuses/filter', { track: hashtag });
io.sockets.on('connection', function (socket) {
  stream.on('tweet', function (tweet) {
    socket.emit('tweet', { tweet: tweet });
  });
});

// Instagram
Insta.set('client_id', '2fe7e5c510224b549d230dafe5d6860e');
Insta.set('client_secret', 'ce4795a3c81042e8b8c1ba40a70137b7');
Insta.set('callback_url', callback_url);

Insta.subscriptions.subscribe({
  object: 'tag',
  object_id: hashtag,
  aspect: 'media',
  callback_url: callback_url,
  type: 'subscription',
  id: '#'
});

app.get('/callback', function (req, res){
  Insta.subscriptions.handshake(req, res);
});

app.post('/callback', function (req, res) {
  console.log('POST ' + req.url);
  var data = req.body;
  var url = 'https://api.instagram.com/v1/tags/'+ hashtag + '/media/recent?client_id=2fe7e5c510224b549d230dafe5d6860e';
  io.sockets.emit('insta', { url: url });
  res.end();
});

server.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
