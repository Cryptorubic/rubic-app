import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class StakingLpApiService {
  constructor(private readonly httpClient: HttpClient) {}
}
