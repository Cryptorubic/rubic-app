import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export const SERVER_REST_URL = `${environment.apiBaseUrl}/`;

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) {}

  public get<T>(url: string, data?: {}, path?: string): Observable<T> {
    return this.http.get<T>((path || SERVER_REST_URL) + (url || ''), {
      params: data || {}
    });
  }

  public patch<T>(url: string, data?: {}, params?: {}, path?: string): Observable<T> {
    return this.http.request<T>('patch', (path || SERVER_REST_URL) + (url || ''), {
      body: data,
      params
    });
  }

  public post<T>(url: string, body?: {}, path?: string, params?: {}): Observable<T> {
    return this.http.post<T>((path || SERVER_REST_URL) + (url || ''), body, params);
  }

  public customDelete<T>(url: string, options?: {}): Observable<T> {
    return this.http.request<T>('delete', SERVER_REST_URL + (url || ''), options);
  }

  public delete<T>(url: string, params?: {}): Observable<T> {
    return this.http.delete<T>(SERVER_REST_URL + (url || ''), params);
  }
}
