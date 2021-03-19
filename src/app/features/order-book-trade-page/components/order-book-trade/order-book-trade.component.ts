import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import { List } from 'immutable';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { OrderBookTradeService } from '../../services/order-book-trade.service';
import { ORDER_BOOK_TRADE_STATUS, OrderBookTradeData } from '../../types/trade-data';

interface Blockchain {
  name: BLOCKCHAIN_NAME;
  label: string;
  imagePath: string;
}

enum TX_STATUS {
  NONE = 'NONE',
  STARTED = 'STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED'
}

type tokensStatus = {
  [tokenPart in TokenPart]: TX_STATUS;
};

type CopiedType = 'linkToDeal' | 'brokerAddress';

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

  public baseAmountToContribute: string;

  public quoteAmountToContribute: string;

  public TX_STATUS = TX_STATUS;

  public approveStatus: tokensStatus = {
    base: TX_STATUS.NONE,
    quote: TX_STATUS.NONE
  };

  public contributeStatus: tokensStatus = {
    base: TX_STATUS.NONE,
    quote: TX_STATUS.NONE
  };

  public withdrawStatus: tokensStatus = {
    base: TX_STATUS.NONE,
    quote: TX_STATUS.NONE
  };

  public expirationDay: string;

  public expirationTime: string;

  public currentUrl: string;

  public isCopied = {
    linkToDeal: false,
    brokerAddress: false
  };

  get tokens(): List<SwapToken> {
    return this._tokens;
  }

  set tokens(value) {
    this._tokens = value.filter(t => t.blockchain === this.tradeData.blockchain);
  }

  get baseAmountToContributeAsNumber(): BigNumber {
    return new BigNumber(this.baseAmountToContribute);
  }

  get quoteAmountToContributeAsNumber(): BigNumber {
    return new BigNumber(this.quoteAmountToContribute);
  }

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

        this.setDynamicData();

        // tokens subscription
        this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
          this.tokens = tokens;

          const foundBaseToken = this.tokens.find(
            t => t.address === this.tradeData.token.base.address
          );
          if (foundBaseToken) {
            this.tradeData.token.base = { ...this.tradeData.token.base, ...foundBaseToken };
          }

          const foundQuoteToken = this.tokens.find(
            t => t.address === this.tradeData.token.quote.address
          );
          if (foundQuoteToken) {
            this.tradeData.token.quote = { ...this.tradeData.token.quote, ...foundQuoteToken };
          }
        });
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

    this.orderBookTradeService.setAllowance(this.tradeData);

    this.setShortedAmountTotal();
    this.orderBookTradeService.setAmountContributed(this.tradeData).then(() => {
      this.setAmountLeft();
    });

    this.orderBookTradeService.setInvestorsNumber(this.tradeData);

    // eslint-disable-next-line no-magic-numbers
    setTimeout(() => this.setDynamicData(), 4000);
  }

  private setExpirationDate(): void {
    const { expirationDate } = this.tradeData;
    this.expirationDay = expirationDate.format('DD.MM.YYYY');
    this.expirationTime = expirationDate.format('HH:mm');
  }

  private setAmountLeft(): void {
    this.setAmountLeftToToken('base');
    this.setAmountLeftToToken('quote');
  }

  private setAmountLeftToToken(tokenPart: TokenPart): void {
    this.tradeData.token[tokenPart].amountLeft = this.tradeData.token[tokenPart].amountTotal.minus(
      this.tradeData.token[tokenPart].amountContributed
    );
  }

  private setShortedAmountTotal(): void {
    this.setShortedAmountTotalToToken('base');
    this.setShortedAmountTotalToToken('quote');
  }

  private setShortedAmountTotalToToken(tokenPart: TokenPart): void {
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

  public getBrokerPercent(tokenPart: TokenPart): string {
    return this.tradeData.token[tokenPart].amountTotal
      .times(this.tradeData.token[tokenPart].brokerPercent)
      .dp(10)
      .toFixed();
  }

  public onCopiedLink(type: CopiedType): void {
    this.isCopied[type] = true;
    setTimeout(() => {
      this.isCopied[type] = false;
    }, 1000);
  }

  public makeApproveOrContribute(tokenPart: TokenPart): void {
    if (!this.tradeData.token[tokenPart].isApproved) {
      this.makeApprove(tokenPart);
    } else {
      this.makeContribute(tokenPart);
    }
  }

  private makeApprove(tokenPart: TokenPart): void {
    this.approveStatus[tokenPart] = TX_STATUS.STARTED;

    this.orderBookTradeService
      .makeApprove(this.tradeData, tokenPart, () => {
        this.approveStatus[tokenPart] = TX_STATUS.IN_PROGRESS;
      })
      .then(() => {
        this.orderBookTradeService.setAllowance(this.tradeData).then(() => {
          this.approveStatus[tokenPart] = TX_STATUS.COMPLETED;
        });
      })
      .catch(err => {
        console.log(err);
        this.approveStatus[tokenPart] = TX_STATUS.ERROR;
      });
  }

  private makeContribute(tokenPart: TokenPart): void {
    this.contributeStatus[tokenPart] = TX_STATUS.STARTED;

    this.orderBookTradeService
      .makeApproveOrContribute(
        this.tradeData,
        tokenPart,
        tokenPart === 'base' ? this.baseAmountToContribute : this.quoteAmountToContribute,
        () => {
          this.contributeStatus[tokenPart] = TX_STATUS.IN_PROGRESS;
        }
      )
      .then(() => {
        this.contributeStatus[tokenPart] = TX_STATUS.COMPLETED;
      })
      .catch(err => {
        console.log(err);
        this.contributeStatus[tokenPart] = TX_STATUS.ERROR;
      });
  }

  public makeWithdraw(tokenPart: TokenPart): void {
    this.withdrawStatus[tokenPart] = TX_STATUS.STARTED;

    this.orderBookTradeService
      .makeWithdraw(this.tradeData, tokenPart, () => {
        this.withdrawStatus[tokenPart] = TX_STATUS.IN_PROGRESS;
      })
      .then(() => {
        this.withdrawStatus[tokenPart] = TX_STATUS.COMPLETED;
      })
      .catch(err => {
        console.log(err);
        this.withdrawStatus[tokenPart] = TX_STATUS.ERROR;
      });
  }
}
