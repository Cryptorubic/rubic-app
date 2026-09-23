import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  Renderer2
} from '@angular/core';
import {
  QR_CODE_CONTAINER_ID,
  QR_CODE_WITH_AMOUNT_CONTAINER_ID
} from '@app/features/trade/components/deposit-form/constants/qr-code-id';
import { DEPOSIT_STEP_ORDER } from '@app/features/trade/components/deposit-form/models/deposit-step-order';
import {
  ActionBtnState,
  QrCodesType
} from '@app/features/trade/components/deposit-form/models/step-types';
import { DepositFormManager } from '@app/features/trade/components/deposit-form/services/deposit-form-manager';
import { BlockchainsInfo } from '@cryptorubic/core';
import { BehaviorSubject, find, map, shareReplay, startWith } from 'rxjs';

@Component({
  selector: 'app-qr-code-container',
  standalone: false,
  templateUrl: './qr-code-container.component.html',
  styleUrl: './qr-code-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrCodeContainerComponent implements AfterViewInit {
  @Output() btnClicked: EventEmitter<void> = new EventEmitter();

  public readonly QR_CODE_CONTAINER_ID = QR_CODE_CONTAINER_ID;

  public readonly QR_CODE_WITH_AMOUNT_CONTAINER_ID = QR_CODE_WITH_AMOUNT_CONTAINER_ID;

  private readonly _showQrWithAmount$ = new BehaviorSubject<boolean>(false);

  public readonly showQrWithAmount$ = this._showQrWithAmount$.asObservable();

  public get showQrWithAmount(): boolean {
    return this._showQrWithAmount$.value;
  }

  public set showQrWithAmount(value: boolean) {
    this._showQrWithAmount$.next(value);
  }

  public readonly showWalletBtn$ = this.depositFormManager.depositTrade$.pipe(
    map(depositTrade => BlockchainsInfo.isEvmBlockchainName(depositTrade.fromToken.blockchain)),
    startWith(false)
  );

  public readonly actionBtnState$ = this.depositFormManager.depositFormSteps$.pipe(
    map(() => this.getActionBtnState())
  );

  public readonly qrCodes$ = this.depositFormManager.depositFormSteps$.pipe(
    map(steps => steps[DEPOSIT_STEP_ORDER.TRADE_INFO]),
    map(tradeInfoStep => tradeInfoStep.qrCodeCanvases),
    shareReplay({ refCount: true, bufferSize: 1 }),
    startWith(null)
  );

  public readonly showToggler$ = this.qrCodes$.pipe(
    map(qrCodes => (qrCodes ? Object.values(qrCodes).filter(Boolean).length > 1 : false)),
    startWith(false)
  );

  constructor(
    private readonly depositFormManager: DepositFormManager,
    private readonly renderer: Renderer2,
    private readonly cdr: ChangeDetectorRef,
    private elRef: ElementRef
  ) {}

  ngAfterViewInit(): void {
    this.qrCodes$.pipe(find(qrCodes => !!qrCodes && !!qrCodes.receiverOnly)).subscribe(qrCodes => {
      if (qrCodes) {
        this.renderQrCodes(qrCodes);
        this.cdr.markForCheck();
      }
    });
  }

  private renderQrCodes(qrCodes: QrCodesType): void {
    const hostEl = this.elRef.nativeElement as HTMLElement;

    const qrWithReceiverEl = hostEl.querySelector(`#${this.QR_CODE_CONTAINER_ID}`);
    qrCodes.receiverOnly.style.borderRadius = '20px';
    this.renderer.appendChild(qrWithReceiverEl, qrCodes.receiverOnly);

    if (qrCodes.receiverWithAmount) {
      const qrWithAmountEl = hostEl.querySelector(`#${this.QR_CODE_WITH_AMOUNT_CONTAINER_ID}`);
      qrCodes.receiverWithAmount.style.borderRadius = '20px';
      this.renderer.appendChild(qrWithAmountEl, qrCodes.receiverWithAmount);
    }
  }

  private getActionBtnState(): ActionBtnState {
    return this.depositFormManager.getActionBtnState(
      DEPOSIT_STEP_ORDER.TRADE_INFO,
      'send_via_wallet'
    );
  }
}
