import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Renderer2
} from '@angular/core';
import { QR_CODE_CONTAINER_ID } from '@app/features/trade/components/deposit-form/constants/qr-code-id';
import { DEPOSIT_STEP_ORDER } from '@app/features/trade/components/deposit-form/models/deposit-step-order';
import { QrCodesType } from '@app/features/trade/components/deposit-form/models/step-types';
import { DepositFormManager } from '@app/features/trade/components/deposit-form/services/injectable/deposit-form-manager';
import { find, map, shareReplay, startWith } from 'rxjs';

@Component({
  selector: 'app-qr-code-container',
  standalone: false,
  templateUrl: './qr-code-container.component.html',
  styleUrl: './qr-code-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrCodeContainerComponent implements AfterViewInit {
  public readonly QR_CODE_CONTAINER_ID = QR_CODE_CONTAINER_ID;

  public readonly qrCodes$ = this.depositFormManager.depositFormSteps$.pipe(
    map(steps => steps[DEPOSIT_STEP_ORDER.TRADE_INFO]),
    map(tradeInfoStep => tradeInfoStep.qrCodeCanvases),
    shareReplay({ refCount: true, bufferSize: 1 }),
    startWith(null)
  );

  constructor(
    private readonly depositFormManager: DepositFormManager,
    private readonly renderer: Renderer2,
    private readonly cdr: ChangeDetectorRef,
    private elRef: ElementRef
  ) {}

  ngAfterViewInit(): void {
    this.qrCodes$.pipe(find(qrCodes => !!qrCodes?.receiverOnly)).subscribe(qrCodes => {
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
  }
}
