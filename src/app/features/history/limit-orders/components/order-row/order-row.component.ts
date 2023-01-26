import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { LimitOrder } from '@core/services/limit-orders/models/limit-order';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { TokensService } from '@core/services/tokens/tokens.service';
import { BlockchainName, EvmBlockchainName, LIMIT_ORDER_STATUS } from 'rubic-sdk';
import { BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { LimitOrdersService } from '@app/core/services/limit-orders/limit-orders.service';
import { ErrorsService } from '@app/core/errors/errors.service';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import {
  RateLevel,
  RateLevelData,
  rateLevelsData
} from '@features/swaps/shared/constants/limit-orders/rate-levels';

@Component({
  selector: '[order-row]',
  templateUrl: './order-row.component.html',
  styleUrls: ['./order-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderRowComponent implements OnInit {
  @Input() order: LimitOrder;

  @Input() mode: 'mobile' | 'order-row';

  public readonly defaultTokenImage = DEFAULT_TOKEN_IMAGE;

  public cancelOrderButtonLoading = false;

  public rateLevelData: RateLevelData;

  private percentDiff: {
    value: number;
    warning: boolean;
  };

  private isEnoughBalance = true;

  public get showCancel(): boolean {
    return this.order.status === LIMIT_ORDER_STATUS.VALID;
  }

  public get statusText(): string {
    return this.order.status === LIMIT_ORDER_STATUS.FILLED ? 'Filled' : 'Expired';
  }

  public get warningText(): string {
    const symbol = this.order.fromToken.symbol;
    const percent = this.percentDiff.value;
    if (this.percentDiff.warning && !this.isEnoughBalance) {
      return `Insufficient ${symbol} balance for order execution. Once you add ${symbol}, the order will be executed at ${percent}% below the market price.`;
    }
    if (!this.isEnoughBalance) {
      return `Insufficient ${symbol} balance for order execution.`;
    }
    return `This order's value is currently ${percent}% below the market price.`;
  }

  public get warningTitle(): string {
    if (this.percentDiff.warning && !this.isEnoughBalance) {
      return 'Bad rate, Balance';
    }
    if (!this.isEnoughBalance) {
      return 'Not enough balance';
    }
    return 'Unfavourable rate';
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly tokensService: TokensService,
    private readonly limitOrdersService: LimitOrdersService,
    private readonly errorsService: ErrorsService
  ) {}

  ngOnInit() {
    if (!this.showCancel) {
      return;
    }

    const { orderRate, marketRate } = this.order;
    const percentDiff = orderRate.minus(marketRate).div(marketRate).dp(2).toNumber();
    if (percentDiff <= -0.1) {
      this.rateLevelData = rateLevelsData[RateLevel.RED];
    } else if (percentDiff <= -0.05) {
      this.rateLevelData = rateLevelsData[RateLevel.YELLOW];
    }
    this.percentDiff = {
      value: percentDiff,
      warning: Boolean(this.rateLevelData)
    };

    if (this.order.fromBalance.lt(this.order.fromAmount)) {
      this.isEnoughBalance = false;
      if (!this.rateLevelData) {
        this.rateLevelData = rateLevelsData[RateLevel.YELLOW];
      }
    }
  }

  public getBlockchainImg(blockchain: BlockchainName): string {
    if (!blockchain) {
      return '';
    }
    return blockchainIcon[blockchain];
  }

  public getBlockchainLabel(blockchain: BlockchainName): string {
    if (!blockchain) {
      return '';
    }
    return blockchainLabel[blockchain];
  }

  public async cancelOrder(): Promise<void> {
    this.cancelOrderButtonLoading = true;
    try {
      await this.limitOrdersService.cancelOrder(
        this.order.fromToken!.blockchain as EvmBlockchainName,
        this.order.hash
      );
    } catch (err) {
      this.errorsService.catch(RubicSdkErrorParser.parseError(err));
      this.cancelOrderButtonLoading = false;
    }
    this.cdr.detectChanges();
  }

  public blockchainLabel(blockchain: BlockchainName): string {
    return BLOCKCHAINS[blockchain].name;
  }

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }

  public async fillOrder(): Promise<void> {
    await this.limitOrdersService.fillOrder(this.order.toToken, this.order.hash);
  }
}
