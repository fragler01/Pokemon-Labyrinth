import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  nickname: string = '';
  errors: Array<any> = new Array();
  room: string = '';
  constructor(private socketioService: SocketioService, private router: Router){

  }
  ngOnInit(){
    this.socketioService.getErrors().subscribe((err:string)=>{
      this.errors.push(err)
      console.log(err)
    })
    this.socketioService.getJoined().subscribe((msg: any)=> {
      console.log(msg)
      if(msg.room.id != ''){
        this.room = msg.room.id
        this.router.navigate(['/room', {roomid: msg.room.id, playerid: msg.playerid}])
      }
    })
  }  
}
