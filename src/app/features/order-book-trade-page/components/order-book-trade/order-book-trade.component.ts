import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { List } from 'immutable';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { Observable, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderBookTradeService } from '../../services/order-book-trade.service';
import { ORDER_BOOK_TRADE_STATUS, OrderBookTradeData } from '../../models/trade-data';
import { MetamaskError } from '../../../../shared/models/errors/provider/MetamaskError';
import { AccountError } from '../../../../shared/models/errors/provider/AccountError';
import { RubicError } from '../../../../shared/models/errors/RubicError';
import { NetworkError } from '../../../../shared/models/errors/provider/NetworkError';
import { MessageBoxComponent } from '../../../../shared/components/message-box/message-box.component';
import { TX_STATUS } from '../../models/TX_STATUS';
import { BIG_NUMBER_FORMAT } from '../../../../shared/constants/formats/BIG_NUMBER_FORMAT';
import ADDRESS_TYPE from '../../../../shared/models/blockchain/ADDRESS_TYPE';
import { TokenPart } from '../../../../shared/models/order-book/tokens';
import { NetworkErrorComponent } from '../../../../shared/components/network-error/network-error.component';

interface Blockchain {
  name: BLOCKCHAIN_NAME;
  label: string;
  imagePath: string;
}

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
      imagePath: 'assets/images/icons/coins/eth-contrast.svg'
    },
    {
      name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      label: 'Binance Smart Chain',
      imagePath: 'assets/images/icons/coins/bnb.svg'
    },
    {
      name: BLOCKCHAIN_NAME.POLYGON,
      label: 'Polygon',
      imagePath: 'assets/images/icons/coins/polygon.svg'
    }
  ];

  public TRADE_STATUS = ORDER_BOOK_TRADE_STATUS;

  public TX_STATUS = TX_STATUS;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public doesTradeExist = true;

  public isMainTradeDataLoaded = false;

  public tradeData: OrderBookTradeData;

  public blockchain: Blockchain;

  private baseToQuoteRate: BigNumber;

  private quoteToBaseRate: BigNumber;

  public isRevertedRate = false;

  public baseTokenAmountToGet: string;

  public quoteTokenAmountToGet: string;

  private _tokens: List<SwapToken>;

  private _tokensSubscription$: Subscription;

  public cancelStatus = TX_STATUS.NONE;

  public cancelTransactionId: string;

  public expirationDay: string;

  public expirationTime: string;

  public currentUrl: string;

  public isCopied = {
    linkToDeal: false,
    brokerAddress: false
  };

  public onAddressChanges: Observable<string>;

  get tokens(): List<SwapToken> {
    return this._tokens;
  }

  set tokens(value) {
    this._tokens = value.filter(t => t.blockchain === this.tradeData.blockchain);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderBookTradeService: OrderBookTradeService,
    private orderBookApiService: OrderBookApiService,
    private tokensService: TokensService,
    private web3PrivateService: Web3PrivateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    try {
      this.checkMetamaskSettings();
    } catch (err) {
      this.showErrorMessage(err);
    }

    this.currentUrl = `https://rubic.exchange${this.router.url}`;

    const uniqueLink = this.route.snapshot.params.unique_link;
    this.setTradeData(uniqueLink);

    this.onAddressChanges = this.web3PrivateService.onAddressChanges;
  }

  ngOnDestroy(): void {
    this._tokensSubscription$?.unsubscribe();
  }

  private checkMetamaskSettings() {
    if (!this.web3PrivateService.isProviderActive) {
      throw new MetamaskError();
    }

    if (!this.web3PrivateService.address) {
      throw new AccountError();
    }
  }

  private showErrorMessage(err: RubicError): void {
    let data: any = { title: 'Error', descriptionText: err.comment };
    if (err instanceof MetamaskError) {
      data.title = 'Warning';
    }
    if (err instanceof NetworkError) {
      data = {
        title: 'Error',
        descriptionComponentClass: NetworkErrorComponent,
        descriptionComponentInputs: { networkError: err }
      };
    }
    this.dialog.open(MessageBoxComponent, {
      width: '400px',
      data
    });
  }

  private setTradeData(uniqueLink: string): void {
    this.orderBookApiService.getTradeData(uniqueLink).subscribe(
      tradeData => {
        this.tradeData = tradeData;
        this.setStaticTradeData();
        this.setDynamicData();

        // tokens subscription
        this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
          this.tokens = tokens;

          const foundBaseToken = this.tokens.find(
            t => t.address.toLowerCase() === this.tradeData.token.base.address.toLowerCase()
          );
          if (foundBaseToken) {
            this.tradeData.token.base = { ...this.tradeData.token.base, ...foundBaseToken };
          }

          const foundQuoteToken = this.tokens.find(
            t => t.address.toLowerCase() === this.tradeData.token.quote.address.toLowerCase()
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

  private async setStaticTradeData(): Promise<void> {
    this.blockchain = this.BLOCKCHAINS.find(b => b.name === this.tradeData.blockchain);
    this.calculateRate();
    this.setExpirationDate();
    this.isMainTradeDataLoaded = true;

    this.tradeData = { ...(await this.orderBookTradeService.setOwner(this.tradeData)) };
  }

  private async setDynamicData(): Promise<void> {
    this.tradeData = { ...(await this.orderBookTradeService.setStatus(this.tradeData)) };
    this.tradeData = { ...(await this.orderBookTradeService.setAllowance(this.tradeData)) };
    this.tradeData = { ...(await this.orderBookTradeService.setAmountContributed(this.tradeData)) };
    this.tradeData = { ...(await this.orderBookTradeService.setInvestorsNumber(this.tradeData)) };

    setTimeout(() => this.setDynamicData(), 10000);
  }

  private setExpirationDate(): void {
    const { expirationDate } = this.tradeData;
    this.expirationDay = expirationDate.format('DD.MM.YYYY');
    this.expirationTime = expirationDate.format('HH:mm');
  }

  private calculateRate(): void {
    this.baseToQuoteRate = this.tradeData.token.base.amountTotal.div(
      this.tradeData.token.quote.amountTotal
    );

    this.quoteToBaseRate = this.tradeData.token.quote.amountTotal.div(
      this.tradeData.token.base.amountTotal
    );
  }

  public getRate(): string {
    return !this.isRevertedRate
      ? `${this.baseToQuoteRate.dp(8).toFormat(BIG_NUMBER_FORMAT)}
         ${this.tradeData.token.base.symbol}
         / 1 ${this.tradeData.token.quote.symbol}`
      : `1 ${this.tradeData.token.base.symbol} /
         ${this.quoteToBaseRate.dp(8).toFormat(BIG_NUMBER_FORMAT)}
         ${this.tradeData.token.quote.symbol}`;
  }

  public calculateAmountToGet(value: string, tokenPart: TokenPart): void {
    if (tokenPart === 'base') {
      this.quoteTokenAmountToGet = new BigNumber(value)
        .times(this.quoteToBaseRate)
        .div(100)
        .times(100 - this.tradeData.token.quote.brokerPercent)
        .dp(this.tradeData.token.quote.decimals)
        .toFormat(BIG_NUMBER_FORMAT);
    } else {
      this.baseTokenAmountToGet = new BigNumber(value)
        .times(this.baseToQuoteRate)
        .div(100)
        .times(100 - this.tradeData.token.base.brokerPercent)
        .dp(this.tradeData.token.base.decimals)
        .toFormat(BIG_NUMBER_FORMAT);
    }
  }

  public onCopiedLink(type: CopiedType): void {
    this.isCopied[type] = true;
    setTimeout(() => {
      this.isCopied[type] = false;
    }, 1000);
  }

  public cancelTrade(): void {
    this.cancelStatus = TX_STATUS.STARTED;

    this.orderBookTradeService
      .cancelTrade(this.tradeData, () => {
        this.cancelStatus = TX_STATUS.IN_PROGRESS;
      })
      .then(receipt => {
        this.cancelStatus = TX_STATUS.COMPLETED;
        this.cancelTransactionId = receipt.transactionHash;
      })
      .catch(err => {
        this.cancelStatus = TX_STATUS.ERROR;
        this.showErrorMessage(err);
      });
  }
}
