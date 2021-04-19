import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HealthcheckService {
  constructor(private httpClient: HttpClient) {}

  public healthCheck(): Promise<boolean> {
    return new Promise(resolve => {
      this.httpClient.get('/api/healthcheck', { observe: 'response' }).subscribe(
        response => resolve(response.status === 200),
        () => resolve(false)
      );
    });
  }
}
