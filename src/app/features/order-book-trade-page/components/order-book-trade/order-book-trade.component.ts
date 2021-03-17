import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import { List } from 'immutable';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { Subscription } from 'rxjs';
import { OrderBookTradeService } from '../../services/order-book-trade.service';
import { ORDER_BOOK_TRADE_STATUS, OrderBookTradeData } from '../../types/trade-data';

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
export class OrderBookTradeComponent implements OnInit, OnDestroy {
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

  private uniqueLink: string;

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

  public readonly TRADE_STATUS = ORDER_BOOK_TRADE_STATUS;

  public doesTradeExist = true;

  public isMainTradeDataLoaded = false;

  public tradeData: OrderBookTradeData;

  public blockchain: Blockchain;

  public isRevertedRate = false;

  public shortedAmountTotal = {
    base: {},
    quote: {}
  };

  private _tokens: List<SwapToken>;

  private _tokensSubscription$: Subscription;

  public expirationDay: string;

  public expirationTime: string;

  public currentUrl: string;

  public isCopied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderBookTradeService: OrderBookTradeService,
    private orderBookApiService: OrderBookApiService,
    private tokensService: TokensService
  ) {}

  ngOnInit(): void {
    this.currentUrl = `https://rubic.exchange${this.router.url}`;

    this.uniqueLink = this.route.snapshot.params.unique_link;
    this.setTradeData();

    this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
      this._tokens = tokens;

      const foundBaseToken = tokens.find(t => t.address === this.tradeData.token.base.address);
      if (foundBaseToken) {
        this.tradeData.token.base = { ...this.tradeData.token.base, ...foundBaseToken };
      }

      const foundQuoteToken = tokens.find(t => t.address === this.tradeData.token.quote.address);
      if (foundQuoteToken) {
        this.tradeData.token.quote = { ...this.tradeData.token.base, ...foundQuoteToken };
      }
    });
  }

  ngOnDestroy(): void {
    this._tokensSubscription$.unsubscribe();
  }

  private setTradeData(): void {
    this.orderBookApiService.getTradeData(this.uniqueLink).subscribe(
      tradeData => {
        this.tradeData = tradeData;
        this.setStaticTradeData();
        this.isMainTradeDataLoaded = true;
        console.log(this.tradeData, this.isMainTradeDataLoaded);

        this.setDynamicData();
        // eslint-disable-next-line no-magic-numbers
        setTimeout(() => this.setDynamicData(), 4000);
      },
      () => {
        this.doesTradeExist = false;
      }
    );
  }

  private setStaticTradeData(): void {
    this.blockchain = this.BLOCKCHAINS.find(b => b.name === this.tradeData.blockchain);
    this.setExpirationDate();
  }

  private setDynamicData(): void {
    this.orderBookTradeService.setStatus(this.tradeData);

    this.setShortedAmountTotal('base');
    this.setShortedAmountTotal('quote');

    this.orderBookTradeService.setAmountContributed(this.tradeData).then(() => {
      this.setAmountLeft('base');
      this.setAmountLeft('quote');
    });

    this.orderBookTradeService.setInvestorsNumber(this.tradeData);
  }

  private setExpirationDate(): void {
    const { expirationDate } = this.tradeData;
    this.expirationDay = expirationDate.toLocaleDateString('ru');
    this.expirationTime = `${expirationDate.getUTCHours()}:${expirationDate.getUTCMinutes()}`;
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
    }, 1000);
  }
}
