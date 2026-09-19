import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { QR_CODE_ID } from '@app/features/trade/components/deposit-form/constants/qr-code-id';
import { DEPOSIT_STEP_ORDER } from '@app/features/trade/components/deposit-form/models/deposit-step-order';
import { ActionBtnState } from '@app/features/trade/components/deposit-form/models/step-types';
import { DepositFormManager } from '@app/features/trade/components/deposit-form/services/deposit-form-manager';
import { BlockchainsInfo } from '@cryptorubic/core';
import { map, startWith } from 'rxjs';

@Component({
  selector: 'app-qr-code-container',
  standalone: false,
  templateUrl: './qr-code-container.component.html',
  styleUrl: './qr-code-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrCodeContainerComponent {
  @Output() btnClicked: EventEmitter<void> = new EventEmitter();

  public readonly QR_CODE_ID = QR_CODE_ID;

  public readonly showWalletBtn$ = this.depositFormManager.depositTrade$.pipe(
    map(depositTrade => BlockchainsInfo.isEvmBlockchainName(depositTrade.fromToken.blockchain)),
    startWith(false)
  );

  constructor(private readonly depositFormManager: DepositFormManager) {}

  public getActionBtnState(): ActionBtnState {
    return this.depositFormManager.getActionBtnState(
      DEPOSIT_STEP_ORDER.TRADE_INFO,
      'send_via_wallet'
    );
  }
}
