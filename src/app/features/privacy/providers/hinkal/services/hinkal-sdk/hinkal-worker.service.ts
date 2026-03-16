import { Injectable } from '@angular/core';
import { WorkerParams, WorkerResponse } from './workers/models/worker-params';
import { filter, fromEvent, map, Observable } from 'rxjs';

@Injectable()
export class HinkalWorkerService {
  private readonly worker = new Worker(new URL('./workers/hinkal.worker', import.meta.url));

  public async request<T>(params: WorkerParams): Promise<T> {
    return new Promise(resolve => {
      const handler = (event: MessageEvent<WorkerResponse<T>>) => {
        if (event.data.type === params.type) {
          this.worker.removeEventListener('message', handler);
          resolve(event.data.result);
        }
      };

      this.worker.addEventListener('message', handler);
      this.worker.postMessage(params);
    });
  }

  public subscribeOnEvent<T>(params: WorkerParams): Observable<T> {
    return fromEvent<MessageEvent<WorkerResponse<T>>>(this.worker, 'message').pipe(
      filter(event => event.data.type === params.type),
      map(event => event.data.result)
    );
  }
}
