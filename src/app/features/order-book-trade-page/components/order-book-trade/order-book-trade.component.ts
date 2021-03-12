import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenPart, TradeData } from '../../../../core/services/order-book/types';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

interface Blockchain {
  name: BLOCKCHAIN_NAME;
  label: string;
  imagePath: string;
}

@Component({
  selector: 'app-order-book-trade',
  templateUrl: './order-book-trade.component.html',
  styleUrls: ['./order-book-trade.component.scss']
})
export class OrderBookTradeComponent implements OnInit {
  private readonly BLOCKCHAINS: Array<Blockchain> = [
    {
      name: BLOCKCHAIN_NAME.ETHEREUM,
      label: 'Ethereum',
      imagePath: 'assets/images/icons/coins/eth.png'
    },
    {
      name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      label: 'Binance Smart Chain',
      imagePath: 'assets/images/icons/coins/bnb.svg'
    },
    {
      name: BLOCKCHAIN_NAME.MATIC,
      label: 'Matic',
      imagePath: 'assets/images/icons/coins/matic.svg'
    }
  ];

  // eslint-disable-next-line no-magic-numbers
  private readonly BILLION = 1e9;

  // eslint-disable-next-line no-magic-numbers
  private readonly MILLION = 1e6;

  public readonly shortedFormat = {
    decimalSeparator: '.',
    groupSeparator: ',',
    // eslint-disable-next-line no-magic-numbers
    groupSize: 3,
    secondaryGroupSize: 0
  };

  public tradeData: TradeData;

  public blockchain: Blockchain;

  public isRevertedRate = false;

  public shortedAmountTotal = {
    base: {},
    quote: {}
  };

  public currentUrl: string;

  public isCopied = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.currentUrl = `https://rubic.exchange${this.router.url}`;
    this.setTradeData();
  }

  private setTradeData(): void {
    this.tradeData = this.route.snapshot.data.tradeData;

    this.blockchain = this.BLOCKCHAINS.find(b => b.name === this.tradeData.blockchain);

    this.setAmountLeft('base');
    this.setAmountLeft('quote');

    this.setShortedAmountTotal('base');
    this.setShortedAmountTotal('quote');
  }

  private setAmountLeft(tokenPart: TokenPart): void {
    this.tradeData.token[tokenPart].amountLeft = this.tradeData.token[tokenPart].amountTotal.minus(
      this.tradeData.token[tokenPart].amountContributed
    );
  }

  private setShortedAmountTotal(tokenPart: TokenPart): void {
    const amount = this.tradeData.token[tokenPart].amountTotal;
    let shortedAmount: string;

    if (amount.isGreaterThanOrEqualTo(this.BILLION * 100)) {
      shortedAmount = `${amount.div(this.BILLION).toFormat(0, this.shortedFormat)}B`;
    } else if (amount.isGreaterThanOrEqualTo(this.MILLION * 100)) {
      shortedAmount = `${amount.div(this.MILLION).dp(0).toFormat(0, this.shortedFormat)}M`;
    } else {
      shortedAmount = amount.toFormat(this.shortedFormat);
    }
    this.shortedAmountTotal[tokenPart] = shortedAmount;
  }

  public getRate(): string {
    const baseToQuoteRate = this.tradeData.token.base.amountTotal
      .div(this.tradeData.token.quote.amountTotal)
      .dp(10)
      .toFormat(this.shortedFormat);
    const quoteToBaseRate = this.tradeData.token.quote.amountTotal
      .div(this.tradeData.token.base.amountTotal)
      .dp(10)
      .toFormat(this.shortedFormat);

    return !this.isRevertedRate
      ? `${baseToQuoteRate} ${this.tradeData.token.base.symbol} / 1 ${this.tradeData.token.quote.symbol}`
      : `1 ${this.tradeData.token.base.symbol} / ${quoteToBaseRate} ${this.tradeData.token.quote.symbol}`;
  }

  public onCopiedLink(): void {
    this.isCopied = true;
    setTimeout(() => {
      this.isCopied = false;
      // eslint-disable-next-line no-magic-numbers
    }, 1000);
  }
}
