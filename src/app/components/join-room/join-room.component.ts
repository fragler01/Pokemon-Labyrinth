import { Component } from '@angular/core';
import { Input } from '@angular/core'
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.scss']
})
export class JoinRoomComponent {
  @Input()  nickname = '';
  room =  '';
  constructor(public socketioService: SocketioService){
    
  }
}
