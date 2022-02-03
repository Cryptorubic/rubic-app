import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import { Observable, timer } from 'rxjs';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { RBC } from 'src/test/tokens/blockchain-tokens/ethereum-test-tokens';
import { map, mapTo } from 'rxjs/operators';
import { PromotionStatistics } from '@features/promotion/models/promotion-statistics.interface';

@Injectable()
export class PromotionApiService {
  constructor(private httpService: HttpService) {}

  public getPromotionTableData(): Observable<PromotionTableData> {
    return timer(1000).pipe(
      map(() => {
        return [
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 1,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 2,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 3,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 4,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 5,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 6,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 1,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 2,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 3,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 4,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 5,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 6,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 1,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 2,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 3,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 4,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 5,
            receivedTokens: 132000,
            token: RBC
          },
          {
            projectName: 'StriceX',
            projectUrl: 'https://strikex.com/',
            invitationDate: new Date(),
            tradingVolume: 10000,
            received: 6,
            receivedTokens: 132000,
            token: RBC
          }
        ];
      })
    );
  }

  public getPromotionStatistics(): Observable<PromotionStatistics> {
    return timer(1000).pipe(
      mapTo({
        integratedProjectsNumber: 2,
        totalRewards: 123.456789,
        instantRewards: 99981212.12313
      })
    );
  }

  public getPromoCode(): Observable<string> {
    return timer(1000).pipe(mapTo('a12b43fec12314gdb1'));
  }
}
