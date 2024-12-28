import { Component } from '@angular/core';
import { EventService } from '../event.service';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})
export class AuthorizationComponent {
  constructor(private eventService:EventService, private socketService:WebSocketService) {

  }


  clientId = "21d10d4b1dab427ea08764e96bb0e88a";
  params = new URLSearchParams(window.location.search);
  code = this.params.get("code");
  host = `${window.location.host}`.substring(10);

  async startGame():Promise<void>{
    this.socketService.sendMessage(JSON.stringify({type:"Start"}));
  }

  async ngOnInit():Promise<void>{
    console.log("Port", this.host);
    console.log("Using params", this.params);
    console.log("Using code", this.code);

    console.log("about to connect to websocket");
      this.socketService.connect("ws://localhost:3001").subscribe(
        {
          next: (data) => {
            const parsedData = JSON.parse(data);
            console.log("Received", data);
          },
          error: (err) => console.error('WebSocket error', err),
          complete: () => console.log('WebSocket connection closed'),
        }
      );
      console.log("done connecting");
    if(this.code){
      const accessToken = await this.getAccessToken(this.clientId, this.code);
      console.log("got access token");
      const profile = await this.fetchProfile(accessToken);
      console.log("fetched profile");
      this.populateUI(profile);
      this.eventService.sendAuthMessage({loggedIn:true, token:accessToken});
      console.log("about to await fetch");
      
      
      
      // const result = await fetch("http://localhost:3000/sendToken",
      //   {
      //     method:"POST",
      //     body: JSON.stringify({token:accessToken, userID:profile.id}),
      //     headers: {
      //       "Content-type": "application/json; charset=UTF-8"
      //     }
      //   });
      this.socketService.sendMessage(JSON.stringify({type:"Auth", token:accessToken, userID:profile.id}));
      
    }
  }
  
  async authorize(): Promise<void>{
  // async ngOnInit(): Promise<void>{
  console.log("here");
  if (!this.code) {
      this.redirectToAuthCodeFlow(this.clientId);
      // this.eventService.sendAuthMessage({loggedIn:true});

  } 
  else {
      const accessToken = await this.getAccessToken(this.clientId, this.code);
      console.log("got access token");
      const profile = await this.fetchProfile(accessToken);
      console.log("fetched profile");
      this.populateUI(profile);
      this.eventService.sendAuthMessage({loggedIn:true, token:accessToken});
      console.log("about to await fetch");
      
      
      console.log("about to connect to websocket");
      this.socketService.connect("ws://localhost:3001").subscribe(
        {
          next: (data) => {
            const parsedData = JSON.parse(data);
            console.log("Received", data);
          },
          error: (err) => console.error('WebSocket error', err),
          complete: () => console.log('WebSocket connection closed'),
        }
      );
      console.log("done connecting");
      // const result = await fetch("http://localhost:3000/sendToken",
      //   {
      //     method:"POST",
      //     body: JSON.stringify({token:accessToken, userID:profile.id}),
      //     headers: {
      //       "Content-type": "application/json; charset=UTF-8"
      //     }
      //   });
      this.socketService.sendMessage(JSON.stringify({type:"Auth", token:accessToken, userID:profile.id}));
      
      // const chosenSong = (await result.json()).song;
        
      // console.log("here", chosenSong); 
      // console.log(await result.json());

  }
}

async redirectToAuthCodeFlow(clientId: string) {
  const verifier = this.generateCodeVerifier(128);
  const challenge = await this.generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", `http://localhost:${this.host}`);
  params.append("scope", "user-read-private user-read-email playlist-read-private");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

generateCodeVerifier(length: number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}


 async getAccessToken(clientId: string, code: string): Promise<string> {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", `http://localhost:${this.host}`);
  params.append("code_verifier", verifier!);

  const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
  });

  const { access_token } = await result.json();
  return access_token;
}

async fetchProfile(token: string): Promise<any> {
  console.log("about to fetch me, using token", token);
  const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
  });
  console.log("Fetch results", result);
  // const result = await fetch("https://api.spotify.com/v1/users/macsenm", {
  //   method: "GET", headers: { Authorization: `Bearer ${token}` }
  // });
  return await result.json();
}

populateUI(profile: any) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  if (profile.images[0]) {
      const profileImage = new Image(200, 200);
      profileImage.src = profile.images[0].url;
      document.getElementById("avatar")!.appendChild(profileImage);
  }
  document.getElementById("id")!.innerText = profile.id;
  document.getElementById("email")!.innerText = profile.email;
  document.getElementById("uri")!.innerText = profile.uri;
  document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
  document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';
}
}
