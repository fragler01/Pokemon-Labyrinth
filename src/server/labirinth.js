const { Tile } = require('./tile.js');
const { pokemons } = require('./pokemons.js')
class Labirinth {

    labirinth = [];
    tiles = [];
    extraTile = '';
    choosablePokemons = pokemons.filter((pokemon, index) => index < 4)
    collactablePokemons = pokemons.filter((pokemon, index) => index >= 4)

    constructor() {
        for (let i = 0; i < 7; i++) {
            this.labirinth[i] = []
            for (let j = 0; j < 7; j++) {
                this.labirinth[i][j] = null;
            }
        }
        this.initTiles()
        //init starting fields
        this.initStartingFields()
        //init fix pokemon fields
        this.initFixPokemonFields()

        this.drawLabirinth()

    }

    initTiles() {
        for (let i = 0; i < 50; i++) {
            this.tiles[i] = new Tile();
            this.tiles[i].id = i;
            if (i < 20) { this.tiles[i].east = false, this.tiles[i].south = false }
            if (i < 6) { this.tiles[i].pokemon = "1" }
            if (i >= 6 && i < 10) { this.tiles[i].starterField = true }
            if (i >= 20 && i < 32) { this.tiles[i].east = false, this.tiles[i].west = false }
            if (i >= 32) { this.tiles[i].south = false, this.tiles[i].pokemon = "1" }
        }
    }

    initStartingFields() {
        let startFieldIndex = this.tiles.findIndex(tile => tile.starterField == true)
        this.labirinth[0][0] = this.tiles[startFieldIndex]
        this.labirinth[0][0].rotate180()
        this.tiles = this.tiles.filter((tile, index) => index != startFieldIndex)
        startFieldIndex = this.tiles.findIndex(tile => tile.starterField == true)
        this.labirinth[0][6] = this.tiles[startFieldIndex]
        this.labirinth[0][6].rotateCCW()
        this.tiles = this.tiles.filter((tile, index) => index != startFieldIndex)
        startFieldIndex = this.tiles.findIndex(tile => tile.starterField == true)
        this.labirinth[6][0] = this.tiles[startFieldIndex]
        this.labirinth[6][0].rotateCW()
        this.tiles = this.tiles.filter((tile, index) => index != startFieldIndex)
        startFieldIndex = this.tiles.findIndex(tile => tile.starterField == true)
        this.labirinth[6][6] = this.tiles[startFieldIndex]
        this.tiles = this.tiles.filter((tile, index) => index != startFieldIndex)
    }

    initFixPokemonFields() {
        let fixTileIndex = this.tiles.findIndex(tile => tile.west == true && tile.north == true && tile.east == true && tile.pokemon != '')
        let pokemonIndex = 4
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j % 2 === 0 && this.labirinth[i][j] === null) || (i == 2 && j == 4)) {
                    this.labirinth[i][j] = this.tiles[fixTileIndex]
                    this.labirinth[i][j].pokemon = pokemons[pokemonIndex]
                    this.labirinth[i][j].rotate180()
                    this.tiles = this.tiles.filter((tile, index) => index != fixTileIndex)
                    pokemonIndex++
                } else if ((j === 0 && i % 2 === 0 && this.labirinth[i][j] === null) || (i == 2 && j == 2)) {
                    this.labirinth[i][j] = this.tiles[fixTileIndex]
                    this.labirinth[i][j].pokemon = pokemons[pokemonIndex]
                    this.labirinth[i][j].rotateCW()
                    this.tiles = this.tiles.filter((tile, index) => index != fixTileIndex)
                    pokemonIndex++
                } else if ((j === 6 && i % 2 === 0 && this.labirinth[i][j] === null) || (i == 4 && j == 4)) {
                    this.labirinth[i][j] = this.tiles[fixTileIndex]
                    this.labirinth[i][j].pokemon = pokemons[pokemonIndex]
                    this.labirinth[i][j].rotateCCW()
                    this.tiles = this.tiles.filter((tile, index) => index != fixTileIndex)
                    pokemonIndex++
                } else if ((i === 6 && j % 2 === 0 && this.labirinth[i][j] === null) || (i == 4 && j == 2)) {
                    this.labirinth[i][j] = this.tiles[fixTileIndex]
                    this.labirinth[i][j].pokemon = pokemons[pokemonIndex]
                    this.tiles = this.tiles.filter((tile, index) => index != fixTileIndex)
                    pokemonIndex++
                }
            }
        }
        this.tiles.forEach(tile => {
            if (tile.pokemon === "1") {
                tile.pokemon = pokemons[pokemonIndex]
                pokemonIndex++;
            }
        });
    }

    drawLabirinth() {
        let rows = ['', '', '', '', '', '', '']

        //draw the this.tiles
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
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
        for (let i = 0; i < 7; i++) {
            rows[i] += " ";
            for (let j = 0; j < 7; j++) {
                if (this.labirinth[i][j] !== null && this.labirinth[i][j].pokemon !== '') {
                    rows[i] += this.labirinth[i][j].pokemon.slice(0, 1)
                } else {
                    rows[i] += "*"
                }
            }
            console.clear()
            console.log(rows[i])
        }
    }

    generateMap() {
        for (let i = 0; i < this.labirinth.length; i++) {
            const row = this.labirinth[i];
            for (let j = 0; j < row.length; j++) {
                const column = row[j];
                if (!column) {
                    this.labirinth[i][j] = this.randomTile()
                    this.labirinth[i][j].randomRotate()
                    this.tiles = this.tiles.filter(tile => tile.id !== this.labirinth[i][j].id)
                }
            }

        }
        this.extraTile = this.tiles[0]
        this.drawLabirinth()
        this.moveRowLeft(1, this.extraTile)
        this.moveRowLeft(1, this.extraTile)
        this.moveRowLeft(1, this.extraTile)
        this.moveRowLeft(1, this.extraTile)


    }
    randomTile() {
        let randomNumber = Math.floor(Math.random() * this.tiles.length)
        return this.tiles[randomNumber]
    }

    moveColumnDown(column, extraTile) {
        let prev = '';
        let temp = '';
        for (let i = 0; i < this.labirinth.length; i++) {
            const row = this.labirinth[i];
            for (let j = 0; j < row.length; j++) {
                const field = row[j];
                if (j === column) {
                    if (i === 0) {
                        prev = field
                        this.labirinth[i][j] = extraTile
                    } else {
                        temp = field
                        this.labirinth[i][j] = prev
                        prev = temp
                    }
                    this.extraTile = prev
                }
            }
        }
        this.drawLabirinth();
        console.log(this.extraTile)
    }
    moveColumnUp(column, extraTile) {
        let prev = '';
        let temp = '';
        for (let i = 0; i < this.labirinth.length; i++) {
            const row = this.labirinth[i];
            for (let j = 0; j < row.length; j++) {
                const field = row[j];
                if (j === column) {
                    if (i === 0) {
                        temp = this.labirinth[i][j]
                        this.labirinth[i][j] = this.labirinth[i + 1][j]
                    } else if (i < this.labirinth.length - 1) {
                        this.labirinth[i][j] = this.labirinth[i + 1][j]
                    } else {
                        this.labirinth[i][j] = extraTile
                    }
                    this.extraTile = temp
                }
            }
        }
        this.drawLabirinth();
        console.log(this.extraTile)
    }
    moveRowRight(row, extraTile) {
        let temp = '';
        for (let i = 0; i < this.labirinth.length; i++) {
            const rowArray = this.labirinth[i];
            if (i === row) {
                for (let j = (rowArray.length - 1); j > (-1); j--) {
                    if (j === rowArray.length - 1) {
                        temp = this.labirinth[i][j]
                        this.labirinth[i][j] = this.labirinth[i][j - 1]
                    } else if (j > 0) {
                        this.labirinth[i][j] = this.labirinth[i][j - 1]
                    } else {
                        this.labirinth[i][j] = extraTile
                    }
                    this.extraTile = temp
                }
            }
        }
        this.drawLabirinth();
        console.log(this.extraTile)
    }
    moveRowLeft(row, extraTile) {
        let temp = '';
        for (let i = 0; i < this.labirinth.length; i++) {
            const rowArray = this.labirinth[i];
            if (i === row) {
                for (let j = 0; j < rowArray.length; j++) {
                    if (j === 0) {
                        temp = this.labirinth[i][j]
                        this.labirinth[i][j] = this.labirinth[i][j + 1]
                    } else if (j < rowArray.length - 1) {
                        this.labirinth[i][j] = this.labirinth[i][j + 1]
                    } else {
                        this.labirinth[i][j] = extraTile
                    }
                    this.extraTile = temp
                }
            }
        }
        this.drawLabirinth();
        console.log(this.extraTile)
    }


}
module.exports = { Labirinth };

