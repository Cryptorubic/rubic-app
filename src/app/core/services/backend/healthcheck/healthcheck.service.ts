import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HealthcheckService {
  constructor(private httpClient: HttpClient) {}

  public healthCheck(): Promise<boolean> {
    return new Promise(resolve => {
      this.httpClient.get(`/api/v1/healthcheck/`, { observe: 'response' }).subscribe(
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        response => resolve(response.status === 200),
        () => resolve(false)
      );
    });
  }
}
