import { Component } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';
import { Input } from '@angular/core'

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})

export class CreateRoomComponent {
  @Input() nickname = ''
  constructor(public socketioService: SocketioService){

  }

}
