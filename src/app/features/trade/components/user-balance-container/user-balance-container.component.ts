import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { debounceTime, distinctUntilChanged, filter, map, startWith, tap } from 'rxjs/operators';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { BehaviorSubject, combineLatestWith } from 'rxjs';
import { compareTokens } from '@shared/utils/utils';
import { PreviewSwapService } from '../../services/preview-swap/preview-swap.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';

@Component({
  selector: 'app-user-balance-container',
  templateUrl: './user-balance-container.component.html',
  styleUrls: ['./user-balance-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserBalanceContainerComponent {
  private readonly _triggerRefresh$ = new BehaviorSubject(null);

  public readonly token$ = this.swapsFormService.fromToken$.pipe(
    combineLatestWith(this._triggerRefresh$.pipe(startWith()), this.tokensFacade.tokens$),
    filter(() => !!this.tokensFacade.tokens),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    map(([fromToken]) => this.tokensFacade.tokens.find(token => compareTokens(fromToken, token)))
  );

  @Input() public hide: 'maxButton' | 'balance';

  @Output() public maxButtonClickEvent = new EventEmitter<void>();

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly swapsFormService: SwapsFormService,
    private readonly previewSwapService: PreviewSwapService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensFacade: TokensFacadeService
  ) {
    this.tokensFacade.tokens$
      .pipe(
        combineLatestWith(this.previewSwapService.transactionState$),
        distinctUntilChanged(),
        debounceTime(20),
        filter(([_, state]) => state.step === 'success' || state.step === 'inactive'),
        tap(([, state]) => {
          if (state.step === 'success') {
            this._triggerRefresh$.next(null);
          }
        })
      )
      .subscribe();
  }
}
