import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { BlockchainName, Token } from '@cryptorubic/core';
import { BehaviorSubject } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { ModalService } from '@core/modals/services/modal.service';
import { PrivateTokensSelectorComponent } from '@features/privacy/components/private-tokens-selector/private-tokens-selector.component';
import { RevealService } from '@features/privacy/services/reveal/reveal.service';

@Component({
  selector: 'app-reveal',
  templateUrl: './reveal.component.html',
  styleUrls: ['./reveal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevealComponent {
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

  private readonly modalService = inject(ModalService);

  private readonly revealService = inject(RevealService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public openSelector(): void {
    this.modalService
      .showDialog(PrivateTokensSelectorComponent, {
        size: 's',
        closeable: false,
        data: this.balances
      })
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
}
