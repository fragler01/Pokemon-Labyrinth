import { Component } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { PokemonService } from 'src/app/services/pokemon.service';
import { SocketioService } from 'src/app/services/socketio.service';


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {
  room: string | null = '';
  players: any[] = [];
  thisPlayer: any;
  myPokemon : string = '';
  labirinth: any;
  gotThePokemons: boolean = false;
  choosablePokemons: any[] = [];
  collectablePokemons: string[] = [];
  collectedPokemons: string[] = [];
  extraTile: any;
  gameState: string = 'lobby';
  isRoomAlive: any;
  whosTurn: string = '';
  availableMoves: {up: boolean, right: boolean, down: boolean, left: boolean} = {up: false, right: false, down: false, left: false};
  playersPokemons: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router, public socketioService: SocketioService) { }
  
  public choosePokemon(pokemon: string) {
    this.socketioService.choosePokemon(pokemon)
    this.myPokemon = pokemon
    this.choosablePokemons = []  
  }
  
  public mayIMoveTheTiles():boolean {
    if(this.gameState === 'tile moving' && this.whosTurn === this.thisPlayer.id){
      return true;
    }else{
      return false
    }
  }

  public mayIMoveMyCharacter():boolean{
    if(this.gameState === 'move character' && this.whosTurn === this.thisPlayer.id){
      return true;
    }else{
      return false
    }
  }

  public isThisMyTurn():boolean{
    if(this.whosTurn === this.thisPlayer.id) return true
    else return false
  }

  public isPlayerOnThisTile(tile:any):boolean{
    let value = false;
    this.playersPokemons.forEach(pokemon => {      
      if(tile?.pokemons.includes(pokemon)) value = true
    });    
    return value
  }

  ngOnInit() {
    const roomid = this.route.snapshot.paramMap.get('roomid');
    console.log(roomid)
    this.isRoomAlive = setInterval(() => {
      this.socketioService.roomExists(roomid?roomid:"")            
    },5000);

    const player = this.route.snapshot.paramMap.get('playerid');
    this.socketioService.socket.emit('arrived to room', { playerid: player, roomid: roomid })
    this.socketioService.getWelcome().subscribe((msg: any) => {
      this.room = msg.room.id
      this.players = msg.room.players
      this.thisPlayer = msg.player
    })
    this.socketioService.getJoined().subscribe((msg: any) => {
      this.room = msg.room.id
      this.players = msg.room.players
    })

    this.socketioService.roomExists(roomid ? roomid : '')
    this.socketioService.getRoomExist().subscribe((msg: any) => {
      if (!msg) { this.router.navigate(['/']) }
    })

    this.socketioService.getPlayerDisconnected().subscribe((room: any) => {
      this.players = room.players;
      console.log('player disconnected', this.players)
    })

    this.socketioService.getGameStarted().subscribe((room: any) => {
      console.log("[Game Started]", room)
      console.log(room.labirinth.gameState)
      this.gameState = room.gameState
      this.labirinth = room.labirinth.labirinth
      this.extraTile = room.labirinth.extraTile
      console.log("[Labirinth]", this.labirinth)
      this.players = room.players
      this.gotThePokemons = true
    })

    this.socketioService.getChoosePokemon().subscribe((pokemons: any) => {
      this.choosablePokemons = pokemons;
      console.log('choose pokemon', pokemons)
    })

    this.socketioService.getRefreshLabirinth().subscribe((labirinth: any) => {
      this.labirinth = labirinth      
    })

    this.socketioService.getRefreshPlayers().subscribe((object: any) => {
      this.players = object.players
      this.players.find(player => player.id == object.sendingPlayer).chosenPokemon = object.chosenPokemon
      this.playersPokemons.push(object.chosenPokemon)
      console.log(object)
    })

    this.socketioService.getReceiveCollectables().subscribe((deck: any) => {
      this.collectablePokemons = deck
      console.log(deck)
    })

    this.socketioService.getWhosTurn().subscribe((playerid: string)=>{
      this.whosTurn = playerid
    })

    this.socketioService.getGamePhase().subscribe((phase: string) => {
      this.gameState = phase
    })

    this.socketioService.getAvailableMoves().subscribe((availableMoves: {up: boolean, right: boolean, down: boolean, left: boolean}) =>{
      this.availableMoves = availableMoves
    })

    this.socketioService.getCatch().subscribe((test) => console.log("test", test))

}
ngOnDestroy(){
  clearInterval(this.isRoomAlive)
}
}
