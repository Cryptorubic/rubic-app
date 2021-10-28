import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Inject,
  Output,
  EventEmitter
} from '@angular/core';
import { Promotion } from '@features/my-trades/models/promotion';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from '@shared/models/blockchain/ADDRESS_TYPE';
import { ScannerLinkPipe } from '@shared/pipes/scanner-link.pipe';
import { WINDOW } from '@ng-web-apis/common';

@Component({
  selector: 'app-gas-refund-card',
  templateUrl: './gas-refund-card.component.html',
  styleUrls: ['./gas-refund-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GasRefundCardComponent {
  @Input() loading: boolean;

  @Input() promoItem: Promotion;

  @Output() refundClick = new EventEmitter<void>();

  constructor(
    private readonly scannerLinkPipe: ScannerLinkPipe,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  public readonly isButtonDisabled = (refundDate: Date): boolean => refundDate > new Date();

  public openInExplorer(hash: string, blockchain: BLOCKCHAIN_NAME): void {
    const link = this.scannerLinkPipe.transform(hash, blockchain, ADDRESS_TYPE.TRANSACTION);
    this.window.open(link, '_blank').focus();
  }
}
