import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthcheckService {
  constructor(private httpClient: HttpClient) {}

  public healthCheck(): Promise<boolean> {
    return new Promise(resolve => {
      this.httpClient
        .get(`${ENVIRONMENT.apiBaseUrl}/healthcheck/`, { observe: 'response' })
        .subscribe(
          response => resolve(response.status === 200),
          () => resolve(false)
        );
    });
  }
}
