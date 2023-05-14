import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io';
import { io } from 'socket.io-client'
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: any;

  constructor() {

  }

  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT)
  }

  test(){
    this.socket.on('test', (testMessage: string)=>{
      console.log(testMessage)
    })
  }

  getMessage() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('heartbeat', (message: string) => {
        observer.next(message)
      })
    })
  }

  getJoined() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('joined', (message: string) => {
        observer.next(message)
      })
    })
  }

  getWelcome(){
    return new Observable((observer: Observer<any>) => {
      this.socket.once('welcome to the room', (msg: any) => {
        observer.next(msg)
      })
    })
  }

  getRoomExist(){
    return new Observable((observer: Observer<any>) => {
      this.socket.on('roomexists', (msg: boolean) => {
        observer.next(msg)
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  getPlayerDisconnected(){
    return new Observable((observer: Observer<any>) =>{
      this.socket.on('player disconnected', (room:any) => {
        console.log('player disconnected')
        observer.next(room);
      })
    })
  }

  getErrors() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('error', (err: string) => {
        observer.next(err)
      })
    })
  }

  getGameStarted(){
    return new Observable((observer: Observer<any>) => {
      this.socket.on('game started', (labirinth: any) => {
        observer.next(labirinth)
      })
    })
  }

  getChoosePokemon(){
    return new Observable((observer: Observer<any>) => {
      this.socket.on('choose pokemon', (pokemons: any) => {
        observer.next(pokemons)
      })
    })
  }

  getRefreshLabirinth(){
    return new Observable((observer: Observer<any>) => {
      this.socket.on('refresh labirinth', (labirinth: any) => {
        observer.next(labirinth)
      })
    })
  }

  getRefreshPlayers(){
    return new Observable((observer: Observer<any>) => {
      this.socket.on('refresh players', (players: any) => {
        observer.next(players)
      })
    })
  }

  getReceiveCollectables(){
    return new Observable((observer: Observer<any>) => {
      this.socket.on('collect these pokemons', (deck: any) => {
        observer.next(deck)
      })
    })
  }
  getWhosTurn(){
    return new Observable((observer: Observer<string>) => {
      this.socket.on('whos turn', (playerid: string) => {
        observer.next(playerid)
      })
    })
  }

  getGamePhase(){
    return new Observable((observer: Observer<string>) => {
      this.socket.on('new phase', (phase: string) => {
        observer.next(phase)
      })
    })
  }

  getAvailableMoves(){
    return new Observable((observer: Observer<{up: boolean, right: boolean, down: boolean, left: boolean}>) => {
      this.socket.on('available moves', (availableMoves: {up: boolean, right: boolean, down: boolean, left: boolean}) => {
        observer.next(availableMoves)
      })
    })
  }

  getCatch(){
    return new Observable((observer: Observer<any>) => {
      this.socket.on('catch', (test:any) => {
        observer.next(test)
      })
    })
  }

  public createRoom(nickname: string) {
    this.socket.emit('createRoom', nickname)
  }

  public joinRoom(nickname: string, roomid: string) {
    this.socket.emit('joinRoom', { nickname: nickname, roomid: roomid })
  }

  public roomExists(room: string){
    this.socket.emit('roomexists', room)
  }

  startGame(room: string){
    this.socket.emit('startRoom', room)
  }

  choosePokemon(pokemon: string){
    this.socket.emit('i choose you', pokemon)
  }

  moveColumnDown(column: number){
    this.socket.emit('moveColumnDown', column)
  }
  moveColumnUp(column: number){
    this.socket.emit('moveColumnUp', column)
  }
  moveRowRight(row: number){
    this.socket.emit('moveRowRight', row)
  }
  moveRowLeft(row: number){
    this.socket.emit('moveRowLeft', row)
  }

  moveCharacter(direction: string){
    this.socket.emit('move character', direction)
  }

  rotateExtraTile(direction : string){
    this.socket.emit('rotate extra tile', direction)
  }

  endTurn(){
    this.socket.emit('end turn')
  }

  catchPokemon(){
    this.socket.emit('catch pokemon')
    this.endTurn()
  }


}
