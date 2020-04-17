const port = 5000

const express = require('express');
let httpServer = require('http').createServer();
const WebSocket = require('ws');
let nextPlayerId = 1;

//setting middleware
const app = express();
app.use(express.static(__dirname + '/public')); //Serves resources from public folder
const webSocketServer = new WebSocket.Server({ server: httpServer });


httpServer.on('request', app);


webSocketServer.on('connection', ws => {
  ws.on('message', msg_data => {
	msg = JSON.parse(msg_data);
	switch(msg.command) {
		case "join":
			ws.send(JSON.stringify({ 
				command: 'join_accepted', 
				data: nextPlayerId++ 
			}));
			break;
		default:
			webSocketServer.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
				  client.send(msg_data);
				}
			});
			break;
    }
  });
});


httpServer.listen(port, () => console.log(`http/ws server listening on ${port}`));
