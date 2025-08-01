import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private socket!: WebSocket;

  connect(): Observable<any> {
    this.socket = new WebSocket('ws://localhost:3001');

    return new Observable((observer) => {
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        observer.next(data);
      };

      this.socket.onerror = (err) => observer.error(err);
      this.socket.onclose = () => observer.complete();
    });
  }
}