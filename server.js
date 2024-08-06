const express = require('express');
const http = require('http');
const cors = require('cors');


const app = express();


const socketio = require('socket.io')
const socketIoClient = require('socket.io-client');


const server = http.createServer(app,()=>{
    console.log('server created');
});



const io = socketio(server, { // Configure CORS on Socket.IO instance
    cors: {
      origin: '*', // Allow connections from your Flask app
      credentials: true // Optional: Allow cookies (if needed)
    }
})


//app.use(express.static('public'));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://skillknightsflask-93e6d75856bb.herokuapp.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

const PORT = process.env.PORT || 3000;

var playerCount = 0;

var matches = [
    room1 = {
        player1: "none",
        player2: "none"
    },
    room2 = {
        player1: "none",
        player2: "none"
    },
    room3 = {
        player1: "none",
        player2: "none"
    },
    room4 = {
        player1: "none",
        player2: "none"
    },
    room5 = {
        player1: "none",
        player2: "none"
    },
];

function findOtherSocketId(socketid){
    for(var i = 0; i < matches.length; i++){
        if(matches[i].player1 == socketid){
            return matches[i].player2;
        }else if(matches[i].player2 == socketid){
            return matches[i].player1;
        }
    }
};

function findMatch(socketid){
    for(var i = 0; i < matches.length; i++){
        if(matches[i].player1 == "none"){
            matches[i].player1 = socketid;
            return "";
        }else if(matches[i].player2 == "none"){
            matches[i].player2 = socketid;
            return "ready";
        }
    }
};

function removePlayer(socketid){
    for(var i = 0; i < matches.length; i++){
        if(matches[i].player1 == socketid || matches[i].player2 == socketid){
            matches[i].player1 = "none";
            matches[i].player2 = "none";
            return;
        }
    }
};

io.on('connection',(socket)=>{
    console.log('a user connected', socket.id);
    socket.on("searchForMatch",()=>{
        var result = findMatch(socket.id);
        if(result == "ready"){
            io.to(socket.id).emit('matchFound');
            io.to(findOtherSocketId(socket.id)).emit('matchFound');
            setTimeout(() => {
                io.to(socket.id).emit('startMatch',"player2");
                io.to(findOtherSocketId(socket.id)).emit('startMatch',"player1");
            }, 3000);
        }
    });

    socket.on('updateMovement', (x,y)=>{   
        io.to(findOtherSocketId(socket.id)).emit('updateMovement', x, y);
    });

    socket.on('updateAnim', (anim,flip)=>{   
        io.to(findOtherSocketId(socket.id)).emit('updateAnim',anim,flip);
    });

    socket.on('damageDealt', (dmg)=>{   
        io.to(findOtherSocketId(socket.id)).emit('takeDamage',dmg);
    });

    socket.on('death', ()=>{   
        io.to(findOtherSocketId(socket.id)).emit("death");
    });

    socket.on('matchLost', ()=>{   
        io.to(findOtherSocketId(socket.id)).emit("matchLost");
    });
    socket.on('enemyName', (name)=>{   
        io.to(findOtherSocketId(socket.id)).emit("enemyName",name);
    });

    socket.on('disconnect',()=>{
        console.log('user disconnected', socket.id);
        io.to(findOtherSocketId(socket.id)).emit('endMatch');
        removePlayer(socket.id);
    });
});

server.listen(PORT,()=>{
    console.log("Server listening...");
});

