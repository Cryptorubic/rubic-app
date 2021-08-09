import { ChangeDetectorRef, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { StoreService } from 'src/app/core/services/store/store.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';

@Injectable({
  providedIn: 'root'
})
export class CounterNotificationsService {
  private unreadTrades: number;

  public unreadTradesChange: Subject<number> = new Subject<number>();

  constructor(
    private readonly store: StoreService,
    private readonly providerConnectorService: ProviderConnectorService
  ) {
    this.unreadTrades =
      (this.store.getItem('unreadTrades'[this.providerConnectorService?.address]) as number) || 0;
    console.log(this.unreadTrades);
  }

  public updateUnseen(count: number) {
    this.unreadTrades += count;
    this.store.setItem('unreadTrades'[this.providerConnectorService?.address], this.unreadTrades);
    this.unreadTradesChange.next(this.unreadTrades);
    console.log(this.unreadTrades);
  }

  public resetCounter(cdr: ChangeDetectorRef) {
    this.unreadTrades += 0;
    this.store.setItem('unreadTrades'[this.providerConnectorService?.address], 0);
    this.unreadTradesChange.next(0);
    cdr.detectChanges();
  }
}
