import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client/build/esm/socket';
import { io } from 'socket.io-client';
import { fromEvent, Observable } from 'rxjs';
import { WsResponse } from '@core/services/api-ws/ws-response';

@Injectable({
  providedIn: 'root'
})
export class ApiWsService {
  private readonly client: Socket;

  constructor() {
    this.client = this.getSocket();
  }

  private getSocket(): Socket {
    const uri = 'http://localhost:3000';
    return io(uri, {
      reconnectionDelayMax: 10000,
      path: '/api/routes/ws/'
    });
  }

  public getRates(): void {
    this.client.emit('calculate', {
      dstTokenAddress: '0x0000000000000000000000000000000000000000',
      dstTokenBlockchain: 'POLYGON',
      referrer: 'rubic.exchange',
      srcTokenAddress: '0x0000000000000000000000000000000000000000',
      srcTokenAmount: '1.05',
      srcTokenBlockchain: 'ETH'
    });
  }

  public subscribeOnEvents(): Observable<WsResponse> {
    return fromEvent(this.client, 'events');
  }
}
