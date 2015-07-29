var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var config = require('./config');
var Insta = require('instagram-node-lib');
var Twit = require('twit');

var callback_url = process.env.CALLBACK_URL + '/callback';
var hashtag = 'blacklivesmatter';

app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function (req, res) {
  res.sendFile(__dirname + '/style.css');
});

// Twitter
var T = new Twit({
  consumer_key: config.twitter.key,
  consumer_secret: config.twitter.consumer_secret,
  access_token: config.twitter.token,
  access_token_secret: config.twitter.token_secret
});

var stream = T.stream('statuses/filter', { track: hashtag });
io.sockets.on('connection', function (socket) {
  stream.on('tweet', function (tweet) {
    socket.emit('tweet', { tweet: tweet });
  });
});

// Instagram
Insta.set('client_id', config.instagram.clientid);
Insta.set('client_secret', config.instagram.secret);
Insta.set('callback_url', callback_url);

Insta.subscriptions.subscribe({
  object: 'tag',
  object_id: hashtag,
  aspect: 'media',
  callback_url: callback_url,
  type: 'subscription',
  id: '#'
});

app.get('/callback', function (req, res) {
  Insta.subscriptions.handshake(req, res);
});

app.post('/callback', function (req, res) {
  var data = req.body;
  var url = 'https://api.instagram.com/v1/tags/'+ hashtag + '/media/recent?client_id=' + config.instagram.clientid;
  io.sockets.emit('insta', { url: url });
  res.end();
});

server.listen((process.env.PORT || 3000), function () {
  console.log('listening on *:3000');
});
