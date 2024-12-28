import { Component } from '@angular/core';
import { EventService } from '../event.service';
import { AuthMessage, FetchedMessage, ReadyMessage, InputMessage } from '../event.service';

@Component({
  selector: 'app-fetcher',
  templateUrl: './fetcher.component.html',
  styleUrls: ['./fetcher.component.scss']
})
export class FetcherComponent {
  constructor(private eventService: EventService) {}
  loggedIn:boolean = false;
  token:string = "";
  currentSong:string = "";
  ngOnInit(){
    this.eventService.getAuthMessage().subscribe((data:AuthMessage) =>
      {  
      // console.log("Message is ", data.loggedIn);
      this.loggedIn = data.loggedIn;
      this.token = data.token;
      this.chooseSong();
    });

    this.eventService.getReadyMessage().subscribe((data:ReadyMessage)=>{
      this.chooseSong();
    });

  }

  /**
   * Queries Spotify for current user's playlists and chooses one
   * Returns JSON object representing playlist
   */
  async choosePlaylist(){
    const result = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "GET", headers: { Authorization: `Bearer ${this.token}` }
    });
    const jsonResult = await result.json();
    const playlists = jsonResult.items;
    const maxLength:number = playlists.length;
    const index = Math.floor(Math.random()*maxLength);
    const tracksUrl:string = playlists[index].tracks.href;
    // console.log(playlists[index]);
    return tracksUrl;

  }

  async chooseSong(){
    const url = await this.choosePlaylist();
    const result = await fetch(url, {
      method: "GET", headers: { Authorization: `Bearer ${this.token}` }
    });
    const jsonResult = await result.json();
    const maxLength = jsonResult.items.length;
    const index = Math.floor(Math.random()*maxLength);
    const chosenTrack = jsonResult.items[index].track;
    this.currentSong = chosenTrack.name; 
    this.eventService.sendFetchedMessage({songName:chosenTrack});
    // console.log(chosenTrack);

  }
}
