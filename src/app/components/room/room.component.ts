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
  room: string | null = '' ;
  players: any[] = []; 
  thisPlayer: any;
  labirinth: any;
  gotThePokemons: boolean = false;
  choosablePokemons: any[] = [];  
  collectablePokemons: string[] = [];
  collectedPokemons: string[] = [];
  

  constructor(private route: ActivatedRoute, private router: Router, public socketioService: SocketioService, public pokemonService : PokemonService) {  }
  public choosePokemon(pokemon: string){
    this.socketioService.choosePokemon(pokemon)
    this.choosablePokemons = []
  }

  ngOnInit(){
    const roomid = this.route.snapshot.paramMap.get('roomid');
    const player = this.route.snapshot.paramMap.get('playerid');
    this.socketioService.socket.emit('arrived to room', {playerid: player, roomid: roomid})
    this.socketioService.getWelcome().subscribe((msg:any)=>{
      console.log(msg)
      this.room = msg.room.id
      this.players = msg.room.players
      this.thisPlayer = msg.player
    })
    this.socketioService.getJoined().subscribe((msg: any) => {
      console.log(msg)
      this.room = msg.room.id
      this.players = msg.room.players
    })


    this.socketioService.roomExists(roomid ? roomid : '')
    this.socketioService.getRoomExist().subscribe((msg: any) => {
      if(!msg){this.router.navigate(['/'])}
    })

    this.socketioService.getPlayerDisconnected().subscribe((room:any) =>{
      this.players = room.players;
      console.log('player disconnected', this.players)
    })

    this.socketioService.getGameStarted().subscribe((room:any) => {
      this.labirinth = room.labirinth.labirinth
      this.players = room.players
      this.gotThePokemons = true      
    })

    this.socketioService.getChoosePokemon().subscribe((pokemons:any) => {
      this.choosablePokemons = pokemons;
      console.log('choose pokemon', pokemons)
    })

    this.socketioService.getRefreshLabirinth().subscribe((labirinth: any)=>{
      this.labirinth = labirinth
    })

    this.socketioService.getRefreshPlayers().subscribe((object: any) => {
      this.players = object.players
      this.players.find(player => player.id == object.sendingPlayer).chosenPokemon = object.chosenPokemon
      console.log(object)
    })

    this.socketioService.getReceiveCollectables().subscribe((deck : any) => {
      this.collectablePokemons = deck
      console.log(deck)
    })

    /* this.pokemonService.getPokemon(name).subscribe(pokemon => {
      this.currentPokemon = pokemon
    }) */
  }

}
