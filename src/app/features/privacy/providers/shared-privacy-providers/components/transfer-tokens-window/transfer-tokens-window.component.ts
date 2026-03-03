import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Injector,
  Output
} from '@angular/core';
import { PrivateEvent } from '../../models/private-event';
import { BehaviorSubject } from 'rxjs';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PrivateModalsService } from '../../services/private-modals/private-modals.service';
import { TokenAmount } from '@cryptorubic/core';

@Component({
  selector: 'app-transfer-tokens-window',
  templateUrl: './transfer-tokens-window.component.html',
  styleUrls: ['./transfer-tokens-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferTokensWindowComponent {
  @Output() public handleTransfer = new EventEmitter<PrivateEvent>();

  private readonly _transferAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly transferAsset$ = this._transferAsset$.asObservable();

  private readonly _transferAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly transferAmount$ = this._transferAmount$.asObservable();

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public openSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this._transferAsset$.next(selectedToken);
      });
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._transferAmount$.next(value);
  }

  public handleMaxButton(): void {}

  public async transfer(): Promise<void> {
    this._loading$.next(true);
    const token = new TokenAmount({
      ...this._transferAsset$.value,
      weiAmount: this._transferAmount$.value?.actualValue
    });
    this.handleTransfer.emit({ token, loadingCallback: () => this._loading$.next(false) });
  }
}
