import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { RefundService } from '../../services/refund-service/refund.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SwapsFormService } from '../../services/swaps-form/swaps-form.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-refund-address',
  templateUrl: './refund-address.component.html',
  styleUrls: ['./refund-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('moveLabel', [
      state('true', style({ color: '#02b774', fontSize: '12px', top: '-4px' })),
      state('false', style({ color: '#9a9ab0', fontSize: '16px', top: '0px' })),
      transition(`true <=> false`, animate('0.2s ease-out'))
    ])
  ]
})
export class RefundAddressComponent implements OnDestroy {
  public readonly refundAddressCtrl = this.refundService.refundAddressCtrl;

  public readonly isCorrectDepositAddressSet$ = this.refundService.isValidRefundAddress$.pipe(
    tap(isCorrectAddress => {
      if (isCorrectAddress) {
        this.refundAddressCtrl.disable({ emitEvent: false });
      }
    })
  );

  public isActiveInput: boolean;

  constructor(
    private readonly refundService: RefundService,
    private readonly swapFormService: SwapsFormService
  ) {
    this.isActiveInput = !!this.refundAddressCtrl.value;
  }

  ngOnDestroy(): void {
    this.refundService.setRefundAddress('');
    this.refundService.refundAddressCtrl.enable();
  }

  public get labetText(): string {
    return `Refund Address (${this.swapFormService.inputValue.fromBlockchain})`;
  }

  public onFocusChange(isFocused: boolean): void {
    this.isActiveInput = isFocused || !!this.refundAddressCtrl.value;
  }
}
