import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HealthcheckService {
  constructor(private httpClient: HttpClient) {}

  public healthCheck(): Observable<boolean> {
    return this.httpClient
      .get('/api/v1/healthcheck', { observe: 'response' })
      .pipe(map(response => response.status === 200));
  }
}
