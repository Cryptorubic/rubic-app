import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LimitOrder } from '@core/services/limit-orders/models/limit-order';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { LIMIT_ORDER_STATUS } from '@core/limit-orders/models/limit-order-status';
import { TokensService } from '@core/services/tokens/tokens.service';
import { BlockchainName } from 'rubic-sdk';
import { BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';

@Component({
  selector: '[order-row]',
  templateUrl: './order-row.component.html',
  styleUrls: ['./order-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderRowComponent {
  @Input() order: LimitOrder;

  @Input() mode: 'mobile' | 'order-row';

  @Output() onClose = new EventEmitter<void>();

  public readonly defaultTokenImage = DEFAULT_TOKEN_IMAGE;

  public cancelOrderButtonLoading = false;

  public get showCancel(): boolean {
    return this.order.status === LIMIT_ORDER_STATUS.VALID;
  }

  constructor(private readonly tokensService: TokensService) {}

  public cancelOrder(): void {}

  public blockchainLabel(blockchain: BlockchainName): string {
    return BLOCKCHAINS[blockchain].name;
  }

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}
