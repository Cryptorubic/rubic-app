import { WA_NAVIGATOR } from '@ng-web-apis/common';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { CrossChainDepositStatus } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { CrossChainPaymentInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { timer } from 'rxjs';

@Component({
  selector: 'app-deposit-status-info',
  templateUrl: './deposit-status-info.component.html',
  styleUrls: ['./deposit-status-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('showDepositAddressAnimation', [
      transition(':enter', [
        style({ height: '0px', padding: 0, 'margin-top': 0 }),
        animate('0.3s ease-out', style({ height: '54px', padding: '1rem', 'margin-top': '1rem' }))
      ])
    ])
  ],
  standalone: false
})
export class DepositStatusInfoComponent {
  public hintShown: boolean = false;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  @Input({ required: true }) status: CrossChainDepositStatus;
  // public statusTemp$ = of(CROSS_CHAIN_DEPOSIT_STATUS.EXPIRED);

  @Input() paymentInfo: CrossChainPaymentInfo;

  constructor(
    @Inject(WA_NAVIGATOR) private readonly navigator: Navigator,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef
  ) {
    // const subscription = this.status$.subscribe(s => {
    //   console.log(s);
    // });
    // setTimeout(() => {
    //   subscription?.unsubscribe()
    // }, 10000);
  }

  public copyToClipboard(address: string): void {
    this.showHint();
    this.navigator.clipboard.writeText(address);
  }

  private showHint(): void {
    this.hintShown = true;
    timer(1500).subscribe(() => {
      this.hintShown = false;
      this.cdr.markForCheck();
    });
  }
}
