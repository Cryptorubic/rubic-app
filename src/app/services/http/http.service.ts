import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export const SERVER_REST_URL = '/api/v1/';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) {}

  public get(url: string, data?: {}, path?: string): Observable<any> {
    data = data || {};
    data['_'] = new Date().getTime();
    return this.http
      .get<any>((path || SERVER_REST_URL) + (url || ''), {
        params: data
      });
  }

  public patch(url: string, data?: {}, path?: string): Observable<any> {
    return this.http
      .request<any>('patch', (path || SERVER_REST_URL) + (url || ''), {
        body: data
      });
  }

  public post(url: string, data?: {}, path?: string): Observable<any> {
    return this.http
      .post<any>((path || SERVER_REST_URL) + (url || ''), data);
  }

  public customDelete(url: string, options?: {}): Observable<any> {
    return this.http
      .request<any>('delete', SERVER_REST_URL + (url || ''), options);
  }

  public delete(url: string, params?: {}): Observable<any> {
    return this.http
      .delete<any>(SERVER_REST_URL + (url || ''), params);
  }

}
