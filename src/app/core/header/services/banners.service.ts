import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, startWith, switchMap, timer } from 'rxjs';
import { ApiBanner } from '../models/banners';
import { HttpService } from '@app/core/services/http/http.service';
import { shareReplayConfig } from '@app/shared/constants/common/share-replay-config';

// refetch banners every 10 minutes
const REFETCH_AFTER = 60 * 10 * 1_000;

const DEFAULT_BANNERS: ApiBanner[] = [
  {
    text: '<b style="color: #00e28d">0 Fees</b> On Rubic For Swaps Below 100$!',
    textMobile: '<b style="color: #00e28d">0 Fees</b> <b>On Rubic</b><br>For Swaps Below 100$!',
    buttonText: '<b>Learn More<b/>',
    linkUrl:
      'https://app.rubic.exchange/?fromChain=ARBITRUM&toChain=ETH&from=USDC&to=ETH&amount=90',
    imageUrlDesktop: 'assets/banner/zero-fees-bg.png',
    imageUrlMobile: 'assets/banner/zero-fees-mobile.png'
  }
];

@Injectable()
export class BannersService {
  public readonly banners$: Observable<ApiBanner[]> = timer(0, REFETCH_AFTER).pipe(
    switchMap(() =>
      this.httpService
        .get<ApiBanner[]>('', {}, 'https://api.rubic.exchange/api/v2/info/banners')
        .pipe(catchError(() => of(DEFAULT_BANNERS)))
    ),
    map(banners => (banners.length ? banners : DEFAULT_BANNERS)),
    shareReplay(shareReplayConfig),
    startWith([])
  );

  constructor(private readonly httpService: HttpService) {}
}
