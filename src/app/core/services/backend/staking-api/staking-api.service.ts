import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class StakingApiService {
  constructor(private readonly httpService: HttpService) {}

  // public getApr() {}
}
