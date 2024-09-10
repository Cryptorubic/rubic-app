import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client/build/esm/socket';

@Injectable()
export class WebSocketService {
  public openConnection(uri: string, query: object): Socket {
    return io(uri, {
      reconnectionDelayMax: 10000,
      auth: {
        token: '123'
      },
      query
    });
  }
}
