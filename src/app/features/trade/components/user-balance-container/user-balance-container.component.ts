import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { debounceTime, map, tap } from 'rxjs/operators';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { BehaviorSubject, combineLatestWith } from 'rxjs';
import { compareTokens } from '@shared/utils/utils';

@Component({
  selector: 'app-user-balance-container',
  templateUrl: './user-balance-container.component.html',
  styleUrls: ['./user-balance-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserBalanceContainerComponent {
  private readonly _triggerRefresh$ = new BehaviorSubject(null);

  private readonly triggerRefresh$ = this._triggerRefresh$.asObservable();

  public readonly token$ = this.swapsFormService.fromToken$.pipe(
    combineLatestWith(this.triggerRefresh$),
    map(([fromToken]) => {
      const findedToken = this.tokensStoreService.tokens.find(token =>
        compareTokens(fromToken, token)
      );
      return findedToken;
    })
  );

  @Input() public hide: 'maxButton' | 'balance';

  @Output() public maxButtonClickEvent = new EventEmitter<void>();

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly walletConnector: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly tokensStoreService: TokensStoreService,
    private readonly swapsFormService: SwapsFormService
  ) {
    this.tokensStoreService.tokens$
      .pipe(
        debounceTime(20),
        tap(() => {
          this._triggerRefresh$.next(null);
        })
      )
      .subscribe();
  }
}
