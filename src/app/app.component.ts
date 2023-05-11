import { Component } from '@angular/core';
import { SocketioService } from './services/socketio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pokemon-game';
  constructor(private socketService : SocketioService){

  }

  ngOnInit(){
    this.socketService.setupSocketConnection();
    this.socketService.getMessage().subscribe((message:string)=>{
      console.log(message)
    })
  }
  ngOnDestroy(){
    this.socketService.disconnect();
  }
}
