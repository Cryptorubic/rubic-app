import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import { Observable, timer } from 'rxjs';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { map, mapTo } from 'rxjs/operators';
import { PromotionStatistics } from '@features/promotion/models/promotion-statistics.interface';
import { RBC } from 'src/test/tokens/blockchain-tokens/ethereum-test-tokens';

const alphabet = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
];

@Injectable()
export class PromotionApiService {
  constructor(private httpService: HttpService) {}

  /**
   * Fetches promotion table data.
   */
  public getPromotionTableData(): Observable<PromotionTableData> {
    return timer(1000).pipe(
      map(() => {
        return [...new Array(30)].map((_, index) => ({
          projectName: alphabet[index % alphabet.length],
          projectUrl: 'https://strikex.com/',
          invitationDate: new Date(Date.now() + index * 100000000),
          tradingVolume: index,
          received: index,
          receivedTokens: index,
          token: RBC
        }));
      })
    );
  }

  /**
   * Fetches promotion statistics.
   */
  public getPromotionStatistics(): Observable<PromotionStatistics> {
    return timer(1000).pipe(
      mapTo({
        integratedProjectsNumber: 2,
        totalRewards: 123.456789,
        instantRewards: 99981212.12313
      })
    );
  }

  /**
   * Fetches promo code by user address
   */
  public getPromoCode(): Observable<string> {
    return timer(1000).pipe(mapTo('a12b43fec12314gdb1'));
  }
}
