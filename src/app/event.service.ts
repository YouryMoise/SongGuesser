import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EventService {
  private authSubject = new Subject<AuthMessage>;
  private fetchedSubject = new Subject<FetchedMessage>;
  private readySubject = new Subject<ReadyMessage>;
  private inputSubject = new Subject<InputMessage>;

  sendAuthMessage(data:AuthMessage){
    this.authSubject.next(data);
  }

  getAuthMessage(){
    return this.authSubject.asObservable();
  }

  sendFetchedMessage(data:FetchedMessage){
    this.fetchedSubject.next(data);
  }

  getFetchedMessage(){
    return this.fetchedSubject.asObservable();
  }

  sendReadyMessage(data:ReadyMessage){
    this.readySubject.next(data);
  }

  getReadyMessage(){
    return this.readySubject.asObservable();
  }

  sendInputMessage(data:InputMessage){
    this.inputSubject.next(data);
  }

  getInputMessage(){
    return this.inputSubject.asObservable();
  }

  constructor() { }
}

export type AuthMessage = {
  loggedIn:boolean;
  token:string;
};

export type FetchedMessage = {
  songName:string
};

export type ReadyMessage = {
  ready:boolean
};

export type InputMessage = {
  correct:boolean,
  time:number,
  done:boolean
};



