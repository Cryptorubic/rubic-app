import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export const SERVER_REST_URL = `/api/v1/`;

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) {}

  public get(url: string, data?: {}, path?: string): Observable<any> {
    const headers = new HttpHeaders({
      'Cache-Control': 'max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
      Pragma: 'no-cache',
      Expires: '0'
    });
    data = data || {};
    return this.http.get<any>((path || SERVER_REST_URL) + (url || ''), {
      params: data,
      headers
    });
  }

  public patch(url: string, data?: {}, params?: {}, path?: string): Observable<any> {
    return this.http.request<any>('patch', (path || SERVER_REST_URL) + (url || ''), {
      body: data,
      params
    });
  }

  public post(url: string, data?: {}, path?: string): Observable<any> {
    return this.http.post<any>((path || SERVER_REST_URL) + (url || ''), data, {
      withCredentials: true
    });
  }

  public customDelete(url: string, options?: {}): Observable<any> {
    return this.http.request<any>('delete', SERVER_REST_URL + (url || ''), options);
  }

  public delete(url: string, params?: {}): Observable<any> {
    return this.http.delete<any>(SERVER_REST_URL + (url || ''), params);
  }
}
