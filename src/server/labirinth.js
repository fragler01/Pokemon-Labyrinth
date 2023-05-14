const { Tile } = require('./tile.js');
const { pokemons } = require('./pokemons.js')
class Labirinth {
    labirinth = [];
    tiles = [];
    extraTilePosition = {row: 0, column: 0};
    choosablePokemons = pokemons.filter((pokemon, index) => index < 4)
    collactablePokemons = pokemons.filter((pokemon, index) => index >= 4)    

    constructor() {
        for (let i = 0; i < 9; i++) {
            this.labirinth[i] = []
            for (let j = 0; j < 9; j++) {
                this.labirinth[i][j] = null;
            }
        }
        this.initTiles()
        this.initStartingFields()
        this.initFixPokemonFields()        
        this.drawLabirinth()

    }

    initTiles() {
        for (let i = 0; i < 50; i++) {
            this.tiles[i] = new Tile();
            this.tiles[i].id = i;
            if (i < 20) { this.tiles[i].east = false, this.tiles[i].south = false }
            if (i < 6) { this.tiles[i].pokemons.push("1") }
            if (i >= 6 && i < 10) { this.tiles[i].starterField = true }
            if (i >= 20 && i < 32) { this.tiles[i].east = false, this.tiles[i].west = false }
            if (i >= 32) { this.tiles[i].south = false, this.tiles[i].pokemons.push("1")}
        }
    }

    initStartingFields() {
        let startFieldIndex = this.tiles.findIndex(tile => tile.starterField == true)
        this.labirinth[1][1] = this.tiles[startFieldIndex]
        this.labirinth[1][1].rotate180()
        this.tiles = this.tiles.filter((tile, index) => index != startFieldIndex)
        startFieldIndex = this.tiles.findIndex(tile => tile.starterField == true)
        this.labirinth[1][7] = this.tiles[startFieldIndex]
        this.labirinth[1][7].rotateCCW()
        this.tiles = this.tiles.filter((tile, index) => index != startFieldIndex)
        startFieldIndex = this.tiles.findIndex(tile => tile.starterField == true)
        this.labirinth[7][1] = this.tiles[startFieldIndex]
        this.labirinth[7][1].rotateCW()
        this.tiles = this.tiles.filter((tile, index) => index != startFieldIndex)
        startFieldIndex = this.tiles.findIndex(tile => tile.starterField == true)
        this.labirinth[7][7] = this.tiles[startFieldIndex]
        this.tiles = this.tiles.filter((tile, index) => index != startFieldIndex)
        console.log('[Init Starting Fields]')
        this.drawLabirinth()
    }

    initFixPokemonFields() {
        console.log("[Init Fix Pokemon Fields]")
        let fixTileIndex = this.tiles.findIndex(tile => tile.west == true && tile.north == true && tile.east == true && tile.pokemons.length > 0)
        let pokemonIndex = 4
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j % 2 === 0 && this.labirinth[i+1][j+1] === null) || (i == 2 && j == 4)) {
                    this.labirinth[i+1][j+1] = this.tiles[fixTileIndex]
                    this.labirinth[i+1][j+1].pokemons = []
                    this.labirinth[i+1][j+1].pokemons.push(pokemons[pokemonIndex])
                    this.labirinth[i+1][j+1].rotate180()
                    this.tiles = this.tiles.filter((tile, index) => index != fixTileIndex)
                    pokemonIndex++
                } else if ((j === 0 && i % 2 === 0 && this.labirinth[i+1][j+1] === null) || (i == 2 && j == 2)) {
                    this.labirinth[i+1][j+1] = this.tiles[fixTileIndex]
                    this.labirinth[i+1][j+1].pokemons = []
                    this.labirinth[i+1][j+1].pokemons.push(pokemons[pokemonIndex])
                    this.labirinth[i+1][j+1].rotateCW()
                    this.tiles = this.tiles.filter((tile, index) => index != fixTileIndex)
                    pokemonIndex++
                } else if ((j === 6 && i % 2 === 0 && this.labirinth[i+1][j+1] === null) || (i == 4 && j == 4)) {
                    this.labirinth[i+1][j+1] = this.tiles[fixTileIndex]
                    this.labirinth[i+1][j+1].pokemons = []
                    this.labirinth[i+1][j+1].pokemons.push(pokemons[pokemonIndex])
                    this.labirinth[i+1][j+1].rotateCCW()
                    this.tiles = this.tiles.filter((tile, index) => index != fixTileIndex)
                    pokemonIndex++
                } else if ((i === 6 && j % 2 === 0 && this.labirinth[i+1][j+1] === null) || (i == 4 && j == 2)) {
                    this.labirinth[i+1][j+1] = this.tiles[fixTileIndex]
                    this.labirinth[i+1][j+1].pokemons = []
                    this.labirinth[i+1][j+1].pokemons.push(pokemons[pokemonIndex])
                    this.tiles = this.tiles.filter((tile, index) => index != fixTileIndex)
                    pokemonIndex++
                }
            }
        }
        this.tiles.forEach(tile => {
            console.log("[tiles]", tile)
            if (tile.pokemons.includes("1")) {
                tile.pokemons = []
                tile.pokemons.push(pokemons[pokemonIndex])
                pokemonIndex++;
            }
        });
    }

    drawLabirinth() {
        let rows = ['', '', '', '', '', '', '', '', '']

        //draw the this.tiles
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.labirinth[i][j] === null) {
                    rows[i] += "*"
                } else {
                    if (this.labirinth[i][j].north === true
                        && this.labirinth[i][j].south === true
                        && this.labirinth[i][j].west === false
                        && this.labirinth[i][j].east === false) {
                        rows[i] += "║"
                    }
                    else if (this.labirinth[i][j].north === true
                        && this.labirinth[i][j].east === true
                        && this.labirinth[i][j].south === false
                        && this.labirinth[i][j].west === false) {
                        rows[i] += "╚"
                    }
                    else if (this.labirinth[i][j].north === true
                        && this.labirinth[i][j].west === true
                        && this.labirinth[i][j].south === false
                        && this.labirinth[i][j].east === false) {
                        rows[i] += "╝"
                    }
                    else if (this.labirinth[i][j].north === false
                        && this.labirinth[i][j].west === true
                        && this.labirinth[i][j].south === false
                        && this.labirinth[i][j].east === true) {
                        rows[i] += "═"
                    }
                    else if (this.labirinth[i][j].north === false
                        && this.labirinth[i][j].west === true
                        && this.labirinth[i][j].south === true
                        && this.labirinth[i][j].east === false) {
                        rows[i] += "╗"
                    }
                    else if (this.labirinth[i][j].north === false
                        && this.labirinth[i][j].west === false
                        && this.labirinth[i][j].south === true
                        && this.labirinth[i][j].east === true) {
                        rows[i] += "╔"
                    }
                    else if (this.labirinth[i][j].north === true
                        && this.labirinth[i][j].west === true
                        && this.labirinth[i][j].south === true
                        && this.labirinth[i][j].east === false) {
                        rows[i] += "╣"
                    }
                    else if (this.labirinth[i][j].north === true
                        && this.labirinth[i][j].west === true
                        && this.labirinth[i][j].south === false
                        && this.labirinth[i][j].east === true) {
                        rows[i] += "╩"
                    }
                    else if (this.labirinth[i][j].north === true
                        && this.labirinth[i][j].west === false
                        && this.labirinth[i][j].south === true
                        && this.labirinth[i][j].east === true) {
                        rows[i] += "╠"
                    }
                    else if (this.labirinth[i][j].north === false
                        && this.labirinth[i][j].west === true
                        && this.labirinth[i][j].south === true
                        && this.labirinth[i][j].east === true) {
                        rows[i] += "╦"
                    }
                }

            }

        }

        //draw the pokemons
        for (let i = 0; i < 9; i++) {
            rows[i] += " ";
            for (let j = 0; j < 9; j++) {
                if (this.labirinth[i][j] !== null && this.labirinth[i][j].pokemons.length > 0) {
                    rows[i] += this.labirinth[i][j].pokemons[0].slice(0, 1)
                } else {
                    rows[i] += "*"
                }
            }
            console.clear()
            console.log(rows[i])
        }

        console.log()
    }

    generateMap() {
        console.log("[Generate Map]")
        for (let i = 1; i < this.labirinth.length-1; i++) {
            const row = this.labirinth[i];
            for (let j = 1; j < row.length-1; j++) {
                const column = row[j];
                if (!column) {
                    this.labirinth[i][j] = this.randomTile()
                    this.labirinth[i][j].randomRotate()
                    this.tiles = this.tiles.filter(tile => tile.id !== this.labirinth[i][j].id)
                }
            }

        }
        // initMovableRowsAndColumns()
        this.labirinth[this.extraTilePosition.row][this.extraTilePosition.column] = this.tiles[0]        
        this.drawLabirinth()

 
    }
    randomTile() {
        let randomNumber = Math.floor(Math.random() * this.tiles.length)
        return this.tiles[randomNumber]
    }

    moveColumnDown(columnIndex) {
        //elmentjuk egy ideiglenes valtozoba az aktualis extra mezot
        let extraTile = this.labirinth[this.extraTilePosition.row][this.extraTilePosition.column]
        //kiuritjuk az extra mezo elozoleg elfoglalt helyet
        this.labirinth[this.extraTilePosition.row][this.extraTilePosition.column] = null
        for (let i = this.labirinth.length-2; i > 0; i--) {
            const row = this.labirinth[i]
            for (let j = 0; j < columnIndex+1; j++) {
                const field = row[j];
                if(j === columnIndex){
                    //az utolso elotti mezot lemozgatjuk egy sorral
                    //majd felfele haladva ugyanezt tesszuk a tobbi mezovel is
                    this.labirinth[i+1][columnIndex] = field
                }
            }
        }
        //a korabban elmentett extra mezot betesszuk a legfelso pozicioba
        this.labirinth[1][columnIndex] = extraTile
        //elmentjuk az uj extra mezo poziciojat
        this.extraTilePosition.row = this.labirinth.length-1
        this.extraTilePosition.column = columnIndex
        this.drawLabirinth();
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //ha az utolsó mezőről leesne a játékos, akkor azt fel kell tenni a pálya másik oldalára!!
    }
    moveColumnUp(columnIndex) {
        let extraTile = this.labirinth[this.extraTilePosition.row][this.extraTilePosition.column]
        this.labirinth[this.extraTilePosition.row][this.extraTilePosition.column] = null
        for (let i = 1; i < this.labirinth.length-1; i++) {
            const row = this.labirinth[i]
            for (let j = 0; j < columnIndex+1; j++) {
                const field = row[j];
                if(j === columnIndex){
                    this.labirinth[i-1][columnIndex] = field
                }
            }
        }
        this.labirinth[this.labirinth.length-2][columnIndex] = extraTile
        this.extraTilePosition.row = 0
        this.extraTilePosition.column = columnIndex
        this.drawLabirinth();
    }
    moveRowRight(row) {
        let extraTile = this.labirinth[this.extraTilePosition.row][this.extraTilePosition.column]
        this.labirinth[this.extraTilePosition.row][this.extraTilePosition.column] = null        
        for (let i = 1; i < row+1; i++) {
            const rowArray = this.labirinth[i];
            if (i === row) {
                for (let j = (rowArray.length - 2); j > 0; j--) {
                    this.labirinth[row][j+1] = this.labirinth[row][j]
                }
            }
        }
        this.labirinth[row][1] = extraTile
        this.extraTilePosition.row = row
        this.extraTilePosition.column = this.labirinth.length-1
        this.drawLabirinth();
    }
    moveRowLeft(row) {
        let extraTile = this.labirinth[this.extraTilePosition.row][this.extraTilePosition.column]
        this.labirinth[this.extraTilePosition.row][this.extraTilePosition.column] = null
        for (let i = 1; i < row+1; i++) {
            const rowArray = this.labirinth[i];
            if (i === row) {
                for (let j = 1; j < rowArray.length-1; j++) {
                    this.labirinth[row][j-1] = this.labirinth[row][j]
                }
            }
        }
        this.labirinth[row][this.labirinth.length-2] = extraTile
        this.extraTilePosition.row = row
        this.extraTilePosition.column = 0
        this.drawLabirinth();
    }

    getAvailableMoves(pokemon){
        console.log("[getAvailableMoves] pokemon", pokemon)
        let currentPokemonCoordinates = this.getPokemonCoordinatesByPokemonName(pokemon)
        let availableMoves = {up: false, right: false, down: false, left: false}
        if(currentPokemonCoordinates.x > 1 
            && this.labirinth[currentPokemonCoordinates.x-1][currentPokemonCoordinates.y].south === true
            && this.labirinth[currentPokemonCoordinates.x][currentPokemonCoordinates.y].north) availableMoves.up = true
        if(currentPokemonCoordinates.x < this.labirinth.length-2 
            && this.labirinth[currentPokemonCoordinates.x+1][currentPokemonCoordinates.y].north === true
            && this.labirinth[currentPokemonCoordinates.x][currentPokemonCoordinates.y].south) availableMoves.down = true
        if(currentPokemonCoordinates.y > 1 
            && this.labirinth[currentPokemonCoordinates.x][currentPokemonCoordinates.y-1].east === true
            && this.labirinth[currentPokemonCoordinates.x][currentPokemonCoordinates.y].west) availableMoves.left = true
        if(currentPokemonCoordinates.y < this.labirinth.length-2 
            && this.labirinth[currentPokemonCoordinates.x][currentPokemonCoordinates.y+1].west === true
            && this.labirinth[currentPokemonCoordinates.x][currentPokemonCoordinates.y].east) availableMoves.right = true
        return availableMoves
    }

    moveCharacter(pokemon, direction){
        let currentPokemonCoordinates = this.getPokemonCoordinatesByPokemonName(pokemon)
        this.labirinth[currentPokemonCoordinates.x][currentPokemonCoordinates.y].pokemons = this.labirinth[currentPokemonCoordinates.x][currentPokemonCoordinates.y].pokemons.filter(poke => poke !== pokemon)
        switch(direction){
            case "up": {                
                this.labirinth[currentPokemonCoordinates.x-1][currentPokemonCoordinates.y].pokemons.push(pokemon)
                break
            }
            case "down": {
                this.labirinth[currentPokemonCoordinates.x+1][currentPokemonCoordinates.y].pokemons.push(pokemon)
                break
            }
            case "right": {                
                this.labirinth[currentPokemonCoordinates.x][currentPokemonCoordinates.y+1].pokemons.push(pokemon)
                break
            }
            default: {
                this.labirinth[currentPokemonCoordinates.x][currentPokemonCoordinates.y-1].pokemons.push(pokemon)                
            }
        }
    }

    getPokemonCoordinatesByPokemonName(pokemonName){    
        let currentPokemonCoordinates = {x: 0, y: 0}
        for (let i = 0; i < this.labirinth.length-1; i++) {
            const row = this.labirinth[i];
            for (let j = 0; j < row.length-1; j++) {
                const tile = row[j];
                if(tile?.pokemons.includes(pokemonName)){
                    currentPokemonCoordinates = {x: i, y:j}
                }
            }
        }
        return currentPokemonCoordinates
    }

}
module.exports = { Labirinth };

