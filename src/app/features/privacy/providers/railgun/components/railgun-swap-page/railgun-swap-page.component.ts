import { ChangeDetectionStrategy, Component, inject, Injector, Input } from '@angular/core';
import { BlockchainName, Token } from '@cryptorubic/core';
import { BehaviorSubject } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { HideService } from '@features/privacy/providers/railgun/services/hide/hide.service';
import { PrivateSwapService } from '@features/privacy/providers/railgun/services/private-swap/private-swap.service';
import { RailgunWalletInfo } from '@railgun-community/shared-models';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { FromAssetsService } from '@features/trade/components/assets-selector/services/from-assets.service';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { RailgunTokensFacadeService } from '@features/privacy/providers/railgun/services/common/railgun-swap-tokens-facade.service';
import { PrivateModalsService } from '@features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';

@Component({
  selector: 'app-railgun-swap-page',
  templateUrl: './railgun-swap-page.component.html',
  styleUrls: ['./railgun-swap-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: TokensFacadeService, useClass: RailgunTokensFacadeService },
    { provide: FromAssetsService, useClass: RailgunPrivateAssetsService },
    { provide: ToAssetsService, useClass: RailgunPrivateAssetsService }
  ]
})
export class RailgunSwapPageComponent {
  @Input({ required: true }) public readonly railgunWalletInfo: RailgunWalletInfo;

  @Input({ required: true }) public readonly balances:
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null;

  private readonly _fromAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly fromAsset$ = this._fromAsset$.asObservable();

  private readonly _toAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly toAsset$ = this._toAsset$.asObservable();

  private readonly _fromAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly fromAmount$ = this._fromAmount$.asObservable();

  private readonly _toAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly toAmount$ = this._toAmount$.asObservable();

  private readonly hideService = inject(HideService);

  private readonly swapService = inject(PrivateSwapService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public readonly modalService = inject(PrivateModalsService);

  private readonly injector = inject(Injector);

  public openFromSelector(): void {
    this.modalService
      .openPublicTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this._fromAsset$.next(selectedToken);
      });
  }

  public openToSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector, {})
      .subscribe((selectedToken: BalanceToken) => {
        this._toAsset$.next(selectedToken);
      });
  }

  public updateFromInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._fromAmount$.next(value);
  }

  public handleMaxButton(): void {}

  public async swapCookbook(): Promise<void> {
    try {
      this._loading$.next(true);
      await this.swapService.swapWithZeroX(
        this.railgunWalletInfo,
        this._fromAsset$.value.address,
        this._fromAsset$.value.decimals,
        Token.toWei(this._fromAmount$.value.actualValue.toFixed(), this._fromAsset$.value.decimals),
        this._toAsset$.value.address,
        this._toAsset$.value.decimals
      );
    } finally {
      this._loading$.next(false);
    }
  }

  public async swap(): Promise<void> {
    try {
      this._loading$.next(true);
      await this.swapService.crossContractCall(
        this.railgunWalletInfo,
        this._fromAsset$.value.address,
        Token.toWei(this._fromAmount$.value.actualValue.toFixed(), this._fromAsset$.value.decimals),
        this._toAsset$.value.address
      );
    } finally {
      this._loading$.next(false);
    }
  }

  public async calculate(): Promise<void> {
    this._toAmount$.next(null);
    this._loading$.next(true);
    const amountOut = await this.swapService.getRates(
      this._fromAsset$.value.address,
      Token.toWei(this._fromAmount$.value.actualValue.toFixed(), this._fromAsset$.value.decimals),
      this._toAsset$.value.address
    );
    const amountOutFormatted = Token.fromWei(amountOut, this._toAsset$.value.decimals).toFixed();
    this._toAmount$.next({
      visibleValue: amountOutFormatted,
      actualValue: new BigNumber(amountOutFormatted)
    });
    this._loading$.next(false);
  }
}
