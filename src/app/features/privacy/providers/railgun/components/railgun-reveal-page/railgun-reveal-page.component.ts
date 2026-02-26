import { ChangeDetectionStrategy, Component, inject, Injector, Input } from '@angular/core';
import { BlockchainName, Token } from '@cryptorubic/core';
import { BehaviorSubject } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { RevealService } from '@features/privacy/providers/railgun/services/reveal/reveal.service';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { RailgunRevealFacadeService } from '@features/privacy/providers/railgun/services/common/railgun-reveal-facade.service';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { PrivateModalsService } from '@features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';

@Component({
  selector: 'app-railgun-reveal-page',
  templateUrl: './railgun-reveal-page.component.html',
  styleUrls: ['./railgun-reveal-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: RailgunPrivateAssetsService },
    { provide: TokensFacadeService, useClass: RailgunRevealFacadeService }
  ]
})
export class RailgunRevealPageComponent {
  private readonly _displayReceiver$ = new BehaviorSubject<boolean>(false);

  public readonly displayReceiver$ = this._displayReceiver$.asObservable();

  @Input({ required: true }) public readonly railgunId: string;

  @Input({ required: true }) balances:
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null;

  private readonly _revealAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly revealAsset$ = this._revealAsset$.asObservable();

  private readonly _revealAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly revealAmount$ = this._revealAmount$.asObservable();

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

  private readonly revealService = inject(RevealService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public openSelector(): void {
    const balanceObject: Partial<Record<BlockchainName, BalanceToken[]>> = {};
    this.balances.forEach(balance => {
      if (!balanceObject[balance.blockchain]) {
        balanceObject[balance.blockchain] = [];
      }
      balanceObject[balance.blockchain].push({
        // @TODO PRIVATE
        decimals: 0,
        favorite: false,
        image: '',
        name: '',
        price: 0,
        rank: 0,
        symbol: '',
        address: balance.address,
        amount: new BigNumber(balance.amount),
        blockchain: balance.blockchain
      });
    });
    this.modalService
      .openPrivateTokensModal(this.injector, balanceObject)
      .subscribe((selectedToken: BalanceToken) => {
        this._revealAsset$.next(selectedToken);
      });
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._revealAmount$.next(value);
  }

  public handleMaxButton(): void {}

  public async reveal(): Promise<void> {
    try {
      this._loading$.next(true);
      const amount = Token.toWei(
        this._revealAmount$.value?.actualValue.toFixed(),
        this._revealAsset$.value?.decimals
      );
      const bigintAmount = BigInt(amount);

      await this.revealService.unshieldTokens(
        this.railgunId,
        this._revealAsset$.value.address,
        bigintAmount.toString()
      );
    } finally {
      this._loading$.next(false);
    }
  }

  public toggleReceiver(): void {
    this._displayReceiver$.next(!this._displayReceiver$.value);
  }
}
