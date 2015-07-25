var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Insta = require('instagram-node-lib');
var callback_url = 'https://catsdaifkl.localtunnel.me' + '/callback';

app.get('/', function (req, res){
  res.sendfile('./index.html');
});

// Instagram config
Insta.set('client_id', '2fe7e5c510224b549d230dafe5d6860e');
Insta.set('client_secret', 'ce4795a3c81042e8b8c1ba40a70137b7');
Insta.set('callback_url', callback_url);

Insta.subscriptions.subscribe({
  object: 'tag',
  object_id: 'nofilter',
  aspect: 'media',
  callback_url: callback_url,
  type: 'subscription',
  id: '#'
});

//
// Instagram API stuff
//
app.get('/callback', function (req, res){
  Insta.subscriptions.handshake(req, res);
});

app.post('/callback', function (req, res) {
  console.log('POST ' + req.url);
  var data = req.body;
  var url = 'https://api.instagram.com/v1/tags/'+ 'nofilter' + '/media/recent?client_id=2fe7e5c510224b549d230dafe5d6860e';
  io.sockets.emit('insta', { url: url });
  res.end();
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
