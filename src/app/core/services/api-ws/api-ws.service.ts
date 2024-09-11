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

  public getRates(params: {
    srcTokenAddress: string;
    srcTokenBlockchain: string;
    srcTokenAmount: string;
    dstTokenAddress: string;
    dstTokenBlockchain: string;
  }): void {
    this.client.emit('calculate', {
      dstTokenAddress: params.dstTokenAddress,
      dstTokenBlockchain: params.dstTokenBlockchain,
      referrer: 'rubic.exchange',
      srcTokenAddress: params.srcTokenAddress,
      srcTokenAmount: params.srcTokenAmount,
      srcTokenBlockchain: params.srcTokenBlockchain
    });
  }

  public subscribeOnEvents(): Observable<WsResponse> {
    return fromEvent(this.client, 'events');
  }
}
