import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import { timeout } from 'rxjs/operators';

export const SERVER_REST_URL = `${ENVIRONMENT.apiBaseUrl}/`;

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) {}

  public get<T>(url: string, data?: {}, path?: string): Observable<T> {
    const request$ = this.http.get<T>((path || SERVER_REST_URL) + (url || ''), {
      params: data || {}
    });
    // @FIX set timeout to 5_000
    return path ? request$ : request$.pipe(timeout(5_000), retry(1));
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

  public delete<T>(url: string, params?: {}, path?: string): Observable<T> {
    return this.http.delete<T>((path || SERVER_REST_URL) + (url || ''), params);
  }
}
