class Tile {
    id = 0;

    north = true
    east = true
    south = true
    west = true

    pokemons = []
    starterField = false

    constructor(){

    }

    rotateCW(){
        let temp = this.north
        this.north = this.west
        this.west = this.south
        this.south = this.east
        this.east = temp
    }

    rotateCCW(){
        let temp = this.north
        this.north = this.east
        this.east = this.south
        this.south = this.west
        this.west = temp
    }

    rotate180(){
        let temp = this.north
        this.north = this.south
        this.south = temp
        temp = this.east
        this.east = this.west
        this.west = temp
    }    

    randomRotate(){
        let randomNumber = Math.floor(Math.random()*4)
        switch (randomNumber) {
            case 0 : this.rotateCW()
            case 1 : this.rotateCCW()
            case 2 : this.rotate180()
            case 3 : return
        }
    }
}

module.exports = { Tile };