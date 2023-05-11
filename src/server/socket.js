
const { v4: uuid } = require('uuid')
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const { Labirinth } = require('./labirinth');
const { pokemons } = require('./pokemons');

let rooms = [];

app.get('/', (req, res) => {
    res.send("Hello World");
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    setInterval(() => {
        socket.emit('heartbeat', 'heartbeat')
    }, 3000);

    socket.on('createRoom', nickname => {
        if (nickname == '') {
            io.to(socket.id).emit('error', "Adj meg nevet")
        } else {
            let roomid = uuid()
            rooms.push({ id: roomid, players: [], labirinth: new Labirinth() })
            rooms.find(room => room.id == roomid).players.push({ id: socket.id, nickname: nickname, roomCreator: true, pokemonsToCollect: [] })
            socket.join(roomid)
            io.to(roomid).emit('joined', {room: rooms.find(room => room.id == roomid), playerid: socket.id})
            console.log(`new room created with the id ${roomid}, new roomlist: `, rooms)
            rooms.forEach(room => {
                console.log(`in the room ${room.id}, there are ${room.players.length} player:`, room.players)
            });
        }
    })

    socket.on('joinRoom', (data) => {
        if (data.nickname == '') {
            console.log(socket.id)
            io.to(socket.id).emit('error', 'Adj meg nevet')
        }
        if (data.roomid == '') {
            console.log(socket.id)
            io.to(socket.id).emit('error', 'Adj meg szoba id-t')
        }
        if (data.roomid != '') {
            if (rooms.find(room => room.id == data.roomid)) {
                socket.join(data.roomid)
                rooms.find(room => room.id == data.roomid).players.push({id: socket.id, nickname: data.nickname, roomCreator: false, pokemonsToCollect: []})
                console.log(data.nickname, " joined ", rooms.find(room => room.id == data.roomid))
                io.to(data.roomid).emit('joined', {room: rooms.find(room => room.id == data.roomid), playerid: socket.id})
            } else {
                socket.emit('error', 'Nincs ilyen szoba')
                socket.to(socket.id).emit('error', 'Nincs ilyen szoba')
            }
        }
    })

    socket.on('arrived to room', (data)=>{
        let room = rooms.find(room => room.id === data.roomid)
        let player = room?.players.find(player => player.id === data.playerid)
        io.to(room?.id).emit('welcome to the room', {room: room, player: player})
    })

    socket.on('roomexists', roomid => {
        let room = rooms.find(room => room.id === roomid)
        if(room != undefined){
            io.to(socket.id).emit('roomexists', true)
        }else{
            io.to(socket.id).emit('roomexists', false)
        }
    })
    socket.on('disconnect', () => {
        console.log('a user disconnected', socket.id)
        for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            if(room.players.find(player => player.id == socket.id) !== undefined){
                rooms[i].players = rooms[i].players.filter(player => player.id !== socket.id)
                io.to(rooms[i].id).emit('player disconnected', rooms[i])
                if(rooms[i].players.length <= 0){
                    rooms = rooms.filter(rm => rm.id !== room.id)
                }
            }            
        }        
        console.log(rooms)
        
    })
    socket.on('startRoom',(roomId) => {
        let thisRoom = rooms.find(room => room.id == roomId)
        thisRoom.choosablePokemons = pokemons.filter((pokemon, index) => index<4)
        thisRoom.labirinth.generateMap()
        thisRoom.gameState = 'started'
        console.log('game started')
        console.log(thisRoom.players)     
        //shuffle players
        /* for (let i = 0; i < 100; i++) {
            let randomNumber = Math.floor(Math.random()*thisRoom.players.length)
            let temp = thisRoom.players[0]
            thisRoom.players[0] = thisRoom.players[randomNumber]
            thisRoom.players[randomNumber] = temp
        }    */
        shuffle(thisRoom.players)
        io.to(thisRoom.players[0].id).emit('choose pokemon', thisRoom.choosablePokemons)
        io.to(thisRoom.id).emit('game started', thisRoom) 
    })

    socket.on('i choose you', (pokemon) => {
        let thisRoom = rooms.find(room => room.players.find(player => player.id == socket.id))
        let thisPlayer = thisRoom.players.find(player => player.id == socket.id)
        let thisPlayerIndex = thisRoom.players.findIndex(player => player.id == socket.id)
        let thisLabirinth = thisRoom.labirinth
        let collectablePokemons = thisRoom.labirinth.collactablePokemons
        thisPlayer.chosenPokemon = pokemon
        io.to(thisRoom.id).emit('refresh players', {players: thisRoom.players, sendingPlayer: socket.id, chosenPokemon: thisPlayer.chosenPokemon})
        thisRoom.choosablePokemons = thisRoom.choosablePokemons.filter(poke => poke != pokemon)

        placePlayerCharacterOnMap(thisPlayerIndex, thisRoom.labirinth.labirinth, pokemon)

        io.to(thisRoom.id).emit('refresh labirinth', thisRoom.labirinth.labirinth)

        if(thisPlayerIndex == thisRoom.players.length-1){
            shuffle(collectablePokemons)
            dealToPlayers(collectablePokemons, thisRoom.players)      
        }else{
            io.to(thisRoom.players[thisPlayerIndex+1].id).emit('choose pokemon', thisRoom.choosablePokemons)
        }

    })
});

placePlayerCharacterOnMap = (playerIndex, map, character) => {
    switch(playerIndex){
        case 0: 
            map[0][0].pokemon = character
            break
        case 1: 
            map[0][6].pokemon = character
            break
        case 2: 
            map[6][6].pokemon = character
            break
        case 3: 
            map[6][0].pokemon = character
    }
}

shuffle = (array) => {
    for (let i = 0; i < 100; i++) {
        let randomNumber = Math.floor(Math.random()*array.length)
        let temp = array[0]
        array[0] = array[randomNumber]
        array[randomNumber] = temp
    }  
}

dealToPlayers = (cardArray, playerArray) => {
    const numberOfCardsPerPlayer = cardArray.length/playerArray.length
    playerArray.forEach((player, playerIndex) => {
        let playersDeck = cardArray.filter((card, cardIndex) => cardIndex < numberOfCardsPerPlayer)
        cardArray = cardArray.filter((card, cardIndex) => cardIndex >= numberOfCardsPerPlayer )
        console.log("playerNickname : ", player.nickname, "deck : ", playersDeck)
        io.to(player.id).emit('collect these pokemons', playersDeck)
        //itt hagytam abba, kikuldom a jatekosoknak a gyujtendo pokemonjaikat
        //még nincs letesztelve, és a frontend oldalra sem írtam meg a fogadó metódust
    });      
}

// io.of('/').adapter.on('create-room', room => console.log(`room ${room} was created`))
// io.of('/').adapter.on('join-room', (roomid, id) => console.log(`${id} joined to room ${roomid}`))

server.listen(3000, '0.0.0.0', () => {
    console.log('listening on *:3000');
});



