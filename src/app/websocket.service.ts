// websocket.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket = new WebSocket("");

  constructor() {}

  // Connect to WebSocket server
  connect(url: string): Observable<any> {
    this.socket = new WebSocket(url);

    return new Observable(observer => {
      this.socket.onmessage = (event) => {
        observer.next(event.data); // Send data to subscribers
      };

      this.socket.onerror = (error) => {
        observer.error(error); // Handle errors
      };

      this.socket.onclose = () => {
        observer.complete(); // Close the connection
      };
    });
  }

  // Send message to server
  sendMessage(message:any): void {
    console.log("In send message");
    console.log("this.socket: ", this.socket);
    console.log("ready socket", this.socket.readyState, WebSocket.OPEN);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("sending");
      this.socket.send(message);
    } else if (this.socket){
      console.log("waiting to open");
      this.socket.onopen = () =>{
        this.socket.send(message);
      }
      console.log("opened and sent");

    }
  }

  // Close the WebSocket connection
  closeConnection(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
