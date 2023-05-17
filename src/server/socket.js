
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
            rooms.find(room => room.id == roomid).players.push({ id: socket.id, nickname: nickname, roomCreator: true, pokemonsToCollect: [], caughtPokemons : [] })
            socket.join(roomid)
            io.to(roomid).emit('joined', { room: rooms.find(room => room.id == roomid), playerid: socket.id })
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
                let room = rooms.find(room => room.id == data.roomid)                
                room.players.push({ id: socket.id, nickname: data.nickname, roomCreator: false, pokemonsToCollect: [], caughtPokemons: [] })
                console.log("[room.players]", room.players)
                console.log(data.nickname, " joined ", rooms.find(room => room.id == data.roomid))
                io.to(data.roomid).emit('joined', { room: rooms.find(room => room.id == data.roomid), playerid: socket.id })
            } else {
                socket.emit('error', 'Nincs ilyen szoba')
                socket.to(socket.id).emit('error', 'Nincs ilyen szoba')
            }
        }
    })

    socket.on('arrived to room', (data) => {
        let room = rooms.find(room => room.id === data.roomid)
        let player = room?.players.find(player => player.id === data.playerid)
        io.to(room?.id).emit('welcome to the room', { room: room, player: player })
    })

    socket.on('roomexists', roomid => {
        let room = rooms.find(room => room.id === roomid)
        if (room != undefined) {
            io.to(socket.id).emit('roomexists', true)
        } else {
            io.to(socket.id).emit('roomexists', false)
        }
    })
    socket.on('disconnect', () => {
        console.log('a user disconnected', socket.id)
        for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            if (room.players.find(player => player.id == socket.id) !== undefined) {
                rooms[i].players = rooms[i].players.filter(player => player.id !== socket.id)
                io.to(rooms[i].id).emit('player disconnected', rooms[i])
                if (rooms[i].players.length <= 0) {
                    rooms = rooms.filter(rm => rm.id !== room.id)
                }
            }
        }
        console.log(rooms)

    })
    socket.on('startRoom', (roomId) => {
        let thisRoom = rooms.find(room => room.id == roomId)
        thisRoom.choosablePokemons = pokemons.filter((pokemon, index) => index < 4)
        thisRoom.labirinth.generateMap()
        thisRoom.gameState = "pokemon choosing"
        console.log('game started')
        shuffle(thisRoom.players)
        io.to(thisRoom.players[0].id).emit('choose pokemon', thisRoom.choosablePokemons)
        io.to(thisRoom.id).emit('whos turn', thisRoom.players[0].id)
        io.to(thisRoom.id).emit('game started', thisRoom)
        io.to(thisRoom.id).emit('new phase', thisRoom.gameState)
    })

    socket.on('i choose you', (pokemon) => {
        let thisRoom = rooms.find(room => room.players.find(player => player.id == socket.id))
        let thisPlayer = thisRoom.players.find(player => player.id == socket.id)
        let thisPlayerIndex = thisRoom.players.findIndex(player => player.id == socket.id)
        let thisLabirinth = thisRoom.labirinth
        let collectablePokemons = thisRoom.labirinth.collactablePokemons

        thisPlayer.chosenPokemon = pokemon
        io.to(thisRoom.id).emit('refresh players', { players: thisRoom.players, sendingPlayer: socket.id, chosenPokemon: thisPlayer.chosenPokemon })
        thisRoom.choosablePokemons = thisRoom.choosablePokemons.filter(poke => poke != pokemon)

        placePlayerCharacterOnMap(thisPlayerIndex, thisRoom.labirinth.labirinth, pokemon)

        io.to(thisRoom.id).emit('refresh labirinth', thisRoom.labirinth.labirinth)

        if (thisPlayerIndex == thisRoom.players.length - 1) {
            shuffle(collectablePokemons)
            dealToPlayers(collectablePokemons, thisRoom)
            thisRoom.currentPlayerId = thisRoom.players[0].id
            io.to(thisRoom.id).emit('whos turn', thisRoom.players[0].id)
            thisRoom.gameState = "tile moving"
            io.to(thisRoom.id).emit('new phase', thisRoom.gameState)
        } else {
            thisRoom.currentPlayerId = thisRoom.players[thisPlayerIndex + 1].id
            io.to(thisRoom.players[thisPlayerIndex + 1].id).emit('choose pokemon', thisRoom.choosablePokemons)
            io.to(thisRoom.id).emit('whos turn', thisRoom.players[thisPlayerIndex + 1].id)
        }
    })

    socket.on('moveColumnDown', (column) => {
        let thisRoom = rooms.find(room => room.players.find(player => player.id == socket.id))
        let thisPokemon = thisRoom.players.find(player => player.id == socket.id).chosenPokemon
        thisRoom.labirinth.moveColumnDown(column)
        //ha player volt az alsó mezőn, akkor azt tegyük át a fölső mezőre
        thisRoom.players.forEach(player => {
            console.log("[vanerajta?]",thisRoom.labirinth.labirinth[thisRoom.labirinth.extraTilePosition.row][thisRoom.labirinth.extraTilePosition.column])
            //.pokemons.includes(player.choosenPokemon)
        });        
        sendInfoToRoom(thisRoom, thisPokemon)
    })
    socket.on('moveColumnUp', (column) => {
        let thisRoom = rooms.find(room => room.players.find(player => player.id == socket.id))
        let thisPokemon = thisRoom.players.find(player => player.id == socket.id).chosenPokemon
        thisRoom.labirinth.moveColumnUp(column)
        sendInfoToRoom(thisRoom, thisPokemon)
    })
    socket.on('moveRowRight', (row) => {
        let thisRoom = rooms.find(room => room.players.find(player => player.id == socket.id))
        let thisPokemon = thisRoom.players.find(player => player.id == socket.id).chosenPokemon
        console.log("[MoveRight]", thisPokemon)
        thisRoom.labirinth.moveRowRight(row)
        sendInfoToRoom(thisRoom, thisPokemon)
    })
    socket.on('moveRowLeft', (row) => {
        let thisRoom = rooms.find(room => room.players.find(player => player.id == socket.id))
        let thisPokemon = thisRoom.players.find(player => player.id == socket.id).chosenPokemon
        thisRoom.labirinth.moveRowLeft(row)
        sendInfoToRoom(thisRoom, thisPokemon)
    })

    sendInfoToRoom = (room, pokemon) => {
        console.log(room.labirinth.getAvailableMoves(pokemon))
        io.to(room.id).emit('refresh labirinth', room.labirinth.labirinth)
        io.to(room.id).emit('new phase', "move character")
        io.to(room.id).emit('available moves', room.labirinth.getAvailableMoves(pokemon))
    }

    socket.on('move character', (direction) => {
        console.log("[socketid]", socket.id)
        console.log("[rooms]", rooms[0].players)
        let thisRoom = rooms.find(room => room.players.find(player => player.id == socket.id))
        let thisPlayer = thisRoom.players.find(player => player.id == socket.id)
        let pokemon = thisPlayer.chosenPokemon
        console.log('[move character]', thisRoom)
        thisRoom.labirinth.moveCharacter(pokemon, direction)
        let playersPosition = thisRoom.labirinth.getPokemonCoordinatesByPokemonName(pokemon)
        let tile = thisRoom.labirinth.labirinth[playersPosition.x][playersPosition.y]           
        let pokemonToCatch = thisPlayer.collactablePokemons[0]
        console.log("[tile]", tile)
        console.log("[pokemontocatch]", pokemonToCatch)
        console.log("[tile.pokemons.include(pokemonToCatch)]",tile.pokemons.includes(pokemonToCatch))
        if (tile.pokemons.includes(pokemonToCatch)) {io.to(thisPlayer.id).emit('catch'); console.log('catch')}
        io.to(thisRoom.id).emit('refresh labirinth', thisRoom.labirinth.labirinth)
        io.to(thisRoom.id).emit('available moves', thisRoom.labirinth.getAvailableMoves(pokemon))
    })

    socket.on('rotate extra tile', (direction) => {
        let thisRoom = rooms.find(room => room.players.find(player => player.id == socket.id))
        if (direction === 'CW') thisRoom.labirinth.labirinth[thisRoom.labirinth.extraTilePosition.row][thisRoom.labirinth.extraTilePosition.column].rotateCW()
        else thisRoom.labirinth.labirinth[thisRoom.labirinth.extraTilePosition.row][thisRoom.labirinth.extraTilePosition.column].rotateCCW()
        io.to(thisRoom.id).emit('refresh labirinth', thisRoom.labirinth.labirinth)
    })

    socket.on('end turn', () => {
        let thisRoom = rooms.find(room => room.players.find(player => player.id == socket.id))
        nextPlayersTurn(thisRoom, socket.id)
    })

    socket.on('catch pokemon', (pokemon) => {        
        let thisRoom = rooms.find(room => room.players.find(player => player.id == socket.id))
        let thisPlayer = thisRoom.players.find(player => player.id == socket.id)
        thisPlayer.caughtPokemons.push(pokemon)
        thisPlayer.pokemonsToCollect = thisPlayer.pokemonsToCollect.filter(poke => poke === pokemon)
        io.to(thisRoom.id).emit('pokemon caught', {playerId: socket.id, pokemon: pokemon})
    })
});

nextPlayersTurn = (room, currentPlayerId) => {
    let players = room.players
    let currentPlayerIndex = players.findIndex(player => player.id === currentPlayerId)
    let idToSend;
    console.log('[players]', players)
    console.log("[players length, playerindex]", players.length, currentPlayerIndex)
    if (currentPlayerIndex < players.length-1) idToSend = players[currentPlayerIndex + 1].id 
    else idToSend = players[0].id 
    console.log('[sending the playerindex]', idToSend)
    io.to(room.id).emit('whos turn', idToSend)
    room.gameState = 'tile moving'
    io.to(room.id).emit('new phase', room.gameState)
}

placePlayerCharacterOnMap = (playerIndex, map, character) => {
    switch (playerIndex) {
        case 0:
            map[1][1].pokemons.push(character)
            break
        case 1:
            map[1][7].pokemons.push(character)
            break
        case 2:
            map[7][7].pokemons.push(character)
            break
        case 3:
            map[7][1].pokemons.push(character)
    }
}

shuffle = (array) => {
    for (let i = 0; i < 100; i++) {
        let randomNumber = Math.floor(Math.random() * array.length)
        let temp = array[0]
        array[0] = array[randomNumber]
        array[randomNumber] = temp
    }
}

dealToPlayers = (cardArray, room) => {
    let playerArray = room.players
    const numberOfCardsPerPlayer = cardArray.length / playerArray.length
    playerArray.forEach((player, playerIndex) => {
        let playersDeck = cardArray.filter((card, cardIndex) => cardIndex < numberOfCardsPerPlayer)
        cardArray = cardArray.filter((card, cardIndex) => cardIndex >= numberOfCardsPerPlayer )
        console.log("playerNickname : ", player.nickname, "deck : ", playersDeck)
        room.players[playerIndex].collactablePokemons = playersDeck
        console.log("[room.players[playerIndex]]",room.players[playerIndex])
        io.to(player.id).emit('collect these pokemons', playersDeck)
    });
}

// io.of('/').adapter.on('create-room', room => console.log(`room ${room} was created`))
// io.of('/').adapter.on('join-room', (roomid, id) => console.log(`${id} joined to room ${roomid}`))

server.listen(3000, '0.0.0.0', () => {
    console.log('listening on *:3000');
});



