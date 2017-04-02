var app = require('http').createServer();
var io = require('socket.io')(app);

app.listen(3000);

io.on('connection', function (socket) {
  console.log('connection');
  // socket.emit('add', JSON.stringify({"type": "button", value: 'Hello World', className: 'button' }));
// socket.emit('add', JSON.stringify({ "type": "input", "className": "first" }));
  socket.emit('set', JSON.stringify({ "className": "page", "property":"backgroundColor", "value": "black" }));

  // socket.emit('add', JSON.stringify({ "type": "input", "className": "second" }));
  // socket.emit('set', JSON.stringify({ "className": "second", "property":"text", "value": "password" }));
 
  // socket.emit('set', JSON.stringify({ className: 'button', property: 'color', value: 'black'}));

  // socket.emit('set', JSON.stringify({ className: 'button', property: 'width', value: '20%'}))
});