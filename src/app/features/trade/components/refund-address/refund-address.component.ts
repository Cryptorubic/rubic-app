import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { RefundService } from '../../services/refund-service/refund.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

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

  public isActiveInput: boolean;

  constructor(
    private readonly refundService: RefundService,
    private readonly walletConectorService: WalletConnectorService
  ) {
    this.isActiveInput = !!this.refundAddressCtrl.value;
  }

  ngOnDestroy(): void {
    this.refundService.setRefundAddress('');
  }

  public get labetText(): string {
    return `Refund Address (${this.walletConectorService.chainType})`;
  }

  public onFocusChange(isFocused: boolean): void {
    this.isActiveInput = isFocused || !!this.refundAddressCtrl.value;
  }
}
