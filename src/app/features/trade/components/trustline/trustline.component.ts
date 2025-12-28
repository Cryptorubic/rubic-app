import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TrustlineService } from '../../services/trustline-service/trustline.service';
import { BehaviorSubject, map } from 'rxjs';
import { TargetNetworkAddressService } from '../../services/target-network-address-service/target-network-address.service';
import { PreviewSwapService } from '../../services/preview-swap/preview-swap.service';
import { TrustlineButtonState } from './models/trustline-button-state';
import { transactionStep } from '../../models/transaction-steps';
import { TransactionState } from '../../models/transaction-state';
import { SwapsStateService } from '../../services/swaps-state/swaps-state.service';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

@Component({
  selector: 'app-trustline',
  templateUrl: './trustline.component.html',
  styleUrls: ['./trustline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrustlineComponent {
  constructor(
    private readonly trustlineService: TrustlineService,
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly previewSwapService: PreviewSwapService,
    private readonly swapsStateService: SwapsStateService
  ) {
    this.setInitialState();
  }

  public readonly trustlineTokenSymbol$ = this.trustlineService.trustlineToken$.pipe(
    map(token => token.symbol)
  );

  private readonly _buttonState$ = new BehaviorSubject<TrustlineButtonState | null>(null);

  private readonly _prevButtonState$ = new BehaviorSubject<TrustlineButtonState | null>(null);

  public readonly buttonState$ = this._buttonState$.asObservable();

  private setButtonState(state: TrustlineButtonState): void {
    this._prevButtonState$.next(this._buttonState$.getValue());
    this._buttonState$.next(state);
  }

  private setPrevButtonState(): void {
    this._buttonState$.next(this._prevButtonState$.getValue());
  }

  private setInitialState(): void {
    const { trade } = this.swapsStateService.currentTrade;

    if (this.targetAddressService.address && trade.to.blockchain === BLOCKCHAIN_NAME.STELLAR) {
      this.setButtonState({
        label: 'Connect Receiver',
        action: () => this.connectReceiver(),
        disabled: false
      });
    } else {
      this.setButtonState({
        label: 'Enable Asset',
        action: () => this.addTrustline(),
        disabled: false
      });
    }
  }

  private async connectReceiver(): Promise<void> {
    this.setLoadingState();

    const isConnected = await this.trustlineService.connectReceiverAddress();

    if (isConnected) {
      this.setButtonState({
        label: 'Enable Asset',
        action: () => this.addTrustline(),
        disabled: false
      });
    } else {
      this.setPrevButtonState();
    }
  }

  private async addTrustline(): Promise<void> {
    this.setLoadingState();

    const hash = await this.trustlineService.addTrustline();
    if (hash) {
      const currState = this.previewSwapService.transactionState;

      const nextState: TransactionState = {
        ...currState,
        data: {
          needTrustlineOptions: {
            needTrustlineAfterSwap: false,
            needTrustlineBeforeSwap: false
          }
        },
        ...(currState.data.needTrustlineOptions?.needTrustlineAfterSwap && {
          step: transactionStep.trustlineReady
        })
      };

      this.previewSwapService.setNextTxState(nextState);
    } else {
      this.setPrevButtonState();
    }
  }

  private setLoadingState(): void {
    this.setButtonState({
      label: 'Loading...',
      disabled: true
    });
  }
}
