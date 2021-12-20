import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class StakingApiService {
  constructor(private readonly httpService: HttpService) {}

  public getApr(): Observable<number> {
    return of(0.8);
    // return this.httpService.get<number>('', {});
  }

  public getRefillTime(): Observable<string> {
    return of(new Date().toString());
    // return this.httpService.get<string>('', {});
  }

  public getUsersDeposit(): Observable<number> {
    return this.httpService.get<number>('', {});
  }

  public updateUsersDeposit(amount: number): Observable<number> {
    console.log(amount);
    return this.httpService.post<number>('', {});
  }
}
