import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { debounceTime, distinctUntilChanged, filter, map, startWith, tap } from 'rxjs/operators';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { BehaviorSubject, combineLatest, combineLatestWith } from 'rxjs';
import { compareTokens } from '@shared/utils/utils';
import { PreviewSwapService } from '../../services/preview-swap/preview-swap.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { CONVERSION_DIRECTION } from '../currency-converter-button/constants/currency-mode';
import { CurrencyConverterService } from '../currency-converter-button/services/currency-converter.service';

@Component({
  selector: 'app-user-balance-container',
  templateUrl: './user-balance-container.component.html',
  styleUrls: ['./user-balance-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserBalanceContainerComponent {
  private readonly _triggerRefresh$ = new BehaviorSubject(null);

  public readonly isDollarMode$ = this.currencyConventerService.isDollarMode$;

  public readonly tokenAmount$ = combineLatest([
    this.swapsFormService.fromToken$,
    this.currencyConventerService.isDollarMode$
  ]).pipe(
    combineLatestWith(this._triggerRefresh$.pipe(startWith()), this.tokensStoreService.tokens$),
    filter(() => !!this.tokensStoreService.tokens),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    map(([[fromToken]]) => {
      const currToken = this.tokensStoreService.tokens.find(token =>
        compareTokens(fromToken, token)
      );

      return currToken
        ? this.currencyConventerService.convertAmount(currToken, CONVERSION_DIRECTION.TO)
        : null;
    })
  );

  @Input() public hide: 'maxButton' | 'balance';

  @Output() public maxButtonClickEvent = new EventEmitter<void>();

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly tokensStoreService: TokensStoreService,
    private readonly swapsFormService: SwapsFormService,
    private readonly previewSwapService: PreviewSwapService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly currencyConventerService: CurrencyConverterService
  ) {
    this.tokensStoreService.tokens$
      .pipe(
        combineLatestWith(this.previewSwapService.transactionState$),
        distinctUntilChanged(),
        debounceTime(20),
        filter(([_, state]) => state.step === 'success' || state.step === 'inactive'),
        tap(([, state]) => {
          if (state.step === 'success') {
            const fromBlockchain = this.swapsFormService.inputValue.fromBlockchain;
            this.tokensStoreService.startBalanceCalculating(fromBlockchain);
            this._triggerRefresh$.next(null);
          }
        })
      )
      .subscribe();

    this.walletConnectorService.addressChange$.subscribe(() => {
      const fromBlockchain = this.swapsFormService.inputValue.fromBlockchain;
      this.tokensStoreService.startBalanceCalculating(fromBlockchain);
    });
  }
}
