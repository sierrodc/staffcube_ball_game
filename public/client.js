// https://www.createjs.com/easeljs
var stage, goCircle, output;
var KEYCODE_LEFT= 90, //z
KEYCODE_RIGHT 	= 88, // x
KEYCODE_UP 		= 38, 
KEYCODE_DOWN 	= 40;

var webSocket;
var currentPlayer = null;
var players = {}; // id: object

function createPlayer(id) {
	var circle = new createjs.Shape();
	circle.graphics.beginFill("red").drawCircle(0, 0, 20);
	circle.teta = 0;
	circle.vel  = 0;
	circle.stepx = 0;
	circle.stepy = 0;
	circle.id = id;
	players[id] = circle;
	stage.addChild(circle);
	return circle;
}

function init() {
	
	webSocket = new WebSocket('ws://localhost:5000');
	webSocket.onopen = () => {
		webSocket.send(JSON.stringify({ command: "join" }));
	};
	webSocket.onmessage = (evt) => { 
		var msg = JSON.parse(evt.data);
		switch(msg.command) {
			case 'join_accepted':
				currentPlayer = createPlayer(+msg.data);
				line.graphics.moveTo(currentPlayer.x, currentPlayer.y);
				createjs.Ticker.on("tick", tick);
				break;
			case 'player_update':
				var p = players[msg.id];
				if(!p)
					p = createPlayer(msg.id);
				
				p.x = msg.x;
				p.y = msg.y;
				p.vel = msg.vel;
				p.teta = msg.teta;
				
				break;
			default:
				break;
		}
	};
	webSocket.onclose = function() { 
		alert("Connection is closed..."); 
	};
	
	stage = new createjs.Stage("demoCanvas");
		
	line = new createjs.Shape();
	stage.addChild(line);
	line.graphics.setStrokeStyle(1).beginStroke("rgba(0,0,0,1)");
	// UI code:
	output = stage.addChild(new createjs.Text("", "14px monospace", "#000"));
	output.lineHeight = 15;
	output.textBaseline = "top";
	output.x = 10;
	output.y = stage.canvas.height-output.lineHeight*3-10;
	
	
	this.document.onkeydown = keyPressed;
}

function keyPressed(event) {
	
	if(!currentPlayer) {
		return;
	}
	
	switch(event.keyCode) {
		case KEYCODE_LEFT:	
			currentPlayer.teta -= 5;
			break;
		case KEYCODE_RIGHT: 
			currentPlayer.teta += 5; 
			break;
		case KEYCODE_UP: 
			currentPlayer.vel -= 5;
			break;
		case KEYCODE_DOWN: 
			currentPlayer.vel += 5;
			break;
	}
	
	webSocket.send(JSON.stringify({ 
		id: currentPlayer.id,
		x: currentPlayer.x,
		y: currentPlayer.y,
		vel: currentPlayer.vel,
		teta: currentPlayer.teta,
		command: "player_update" 
	}));
}



function tick(event) {
    if (!createjs.Ticker.getPaused()) {
		for(var pidx in players) {
			var p = players[pidx];
			p.x += p.vel*Math.cos(p.teta*3.14/180.0);
			p.y += p.vel*Math.sin(p.teta*3.14/180.0);
			if (p.x > stage.canvas.width) 	{ p.x = 0; }
			if (p.x < 0) 					{ p.x = stage.canvas.width; }
			if (p.y > stage.canvas.height) 	{ p.y = 0; }
			if (p.y < 0) 					{ p.y = stage.canvas.height; }
			
			if(p === currentPlayer) {
				// Tell EaselJS where to draw the line to
				line.graphics.lineTo(currentPlayer.x, currentPlayer.y);
			}
		}
    }
	
	// output.text = "getPaused()    = "+createjs.Ticker.getPaused()+"\n"+
		// "getTime(true)  = "+createjs.Ticker.getTime(true)+"\n"+
		// "getTime(false) = "+createjs.Ticker.getTime(false);			output.text = "getPaused()    = "+createjs.Ticker.getPaused()+"\n"+
	output.text = "playerId: " + currentPlayer.id + "\n" +
		"teta    = "+currentPlayer.teta + "\n" +
		"vel  = "+currentPlayer.vel + "\n" +
		"x, y = "+currentPlayer.x + "," + currentPlayer.y;
	
	stage.update(event); // important!!
}

function togglePause() {
	var paused = !createjs.Ticker.getPaused();
	createjs.Ticker.setPaused(paused);
	document.getElementById("pauseBtn").value = paused ? "unpausedd" : "pause";
}