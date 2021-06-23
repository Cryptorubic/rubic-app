import { Injectable, OnDestroy } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Web3PublicService } from '../../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { InstantTradesApiService } from '../../../../../../core/services/backend/instant-trades-api/instant-trades-api.service';
import { InstantTradesPostApi } from '../../../../../../core/services/backend/instant-trades-api/types/trade-api';
import { INTSTANT_TRADES_TRADE_STATUS } from '../../../../models/trade-data';

@Injectable({
  providedIn: 'root'
})
export class InstantTradesFormService implements OnDestroy {
  public onInstantTradesUpdated: Subject<void> = new Subject();

  constructor(
    private readonly web3PublicService: Web3PublicService,
    private readonly instantTradesApiService: InstantTradesApiService
  ) {}

  ngOnDestroy(): void {
    this.onInstantTradesUpdated.unsubscribe();
  }

  public async createTrade(data: InstantTradesPostApi, blockchain) {
    const web3Public = this.web3PublicService[blockchain];
    const transaction = await web3Public.getTransactionByHash(data.hash, 0, 60, 1000);
    const delay = transaction ? 100 : 1000;
    // TODO: Fix post request. Have to delay request to fix problem with finding transaction on backend.
    timer(delay)
      .pipe(switchMap(() => this.instantTradesApiService.createTrade(data)))
      .subscribe(() => this.onInstantTradesUpdated.next());
  }

  public updateTrade(hash: string, status: INTSTANT_TRADES_TRADE_STATUS) {
    return this.instantTradesApiService.patchTrade(hash, status).subscribe(
      () => this.onInstantTradesUpdated.next(),
      err => {
        console.debug('IT patch request is failed', err);
      }
    );
  }
}
