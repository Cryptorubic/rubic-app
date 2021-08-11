import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { StoreService } from 'src/app/core/services/store/store.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';

@Injectable({
  providedIn: 'root'
})
export class CounterNotificationsService {
  private unreadTrades: number = 0;

  private unreadReceived: number = 0;

  public unreadTradesChange: Subject<number> = new Subject<number>();

  public $currentUser: Observable<UserInterface>;

  constructor(
    private readonly storeService: StoreService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly myTradesService: MyTradesService
  ) {
    this.$currentUser = this.authService.getCurrentUser();
    this.myTradesService.getUnreadTrades().subscribe(count => {
      this.unreadReceived = count;
    });
    this.$currentUser.subscribe(user => {
      const unreadTradesJSON = this.storeService.getItem('unreadTrades');
      if (unreadTradesJSON) {
        this.unreadTrades = JSON.parse(unreadTradesJSON as string)[user?.address];
        this.unreadTradesChange.next(this.unreadTrades + this.unreadReceived);
      }
    });
  }

  public updateUnseen(count: number = 1) {
    this.unreadTrades += count;
    const data = JSON.stringify({ [this.providerConnectorService?.address]: this.unreadTrades });
    this.storeService.setItem('unreadTrades', data, true);
    this.unreadTradesChange.next(this.unreadTrades + this.unreadReceived);
  }

  public resetCounter() {
    this.unreadTrades += 0;
    const data = JSON.stringify({ [this.providerConnectorService?.address]: 0 });
    this.storeService.setItem('unreadTrades', data, true);
    this.unreadTradesChange.next(0 + this.unreadReceived);
  }
}
