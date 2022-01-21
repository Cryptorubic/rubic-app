import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import { Observable, timer } from 'rxjs';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { RBC } from 'src/test/tokens/blockchain-tokens/ethereum-test-tokens';
import { mapTo } from 'rxjs/operators';

@Injectable()
export class PromotionApiService {
  constructor(private httpService: HttpService) {}

  public getPromotionData(): Observable<PromotionTableData> {
    return timer(1000).pipe(
      mapTo([
        {
          projectName: 'StriceX',
          projectUrl: 'https://strikex.com/',
          invitationDate: new Date(),
          tradingVolume: 10000,
          received: 30.12,
          receivedTokens: 132000,
          token: RBC
        },
        {
          projectName: 'StriceX',
          projectUrl: 'https://strikex.com/',
          invitationDate: new Date(),
          tradingVolume: 10000,
          received: 30.12,
          receivedTokens: 132000,
          token: RBC
        }
      ])
    );
  }
}
