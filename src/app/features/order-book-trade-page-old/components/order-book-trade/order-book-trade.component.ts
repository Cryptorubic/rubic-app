import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { List } from 'immutable';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { Observable, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { WithRoundPipe } from 'src/app/shared/pipes/with-round.pipe';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { WalletError } from 'src/app/shared/models/errors/provider/WalletError';
import { AccountError } from 'src/app/shared/models/errors/provider/AccountError';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/BIG_NUMBER_FORMAT';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import { ErrorsOldService } from 'src/app/core/services/errors-old/errors-old.service';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import ADDRESS_TYPE from '../../../../shared/models/blockchain/ADDRESS_TYPE';
import { TX_STATUS } from '../../models/TX_STATUS';
import { ORDER_BOOK_TRADE_STATUS, OrderBookTradeData } from '../../models/trade-data';
import { OrderBookTradeService } from '../../services/order-book-trade.service';

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
export class OrderBookTradeComponent implements AfterViewInit, OnDestroy {
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

  private fromTokenToToTokenRate: string;

  private toTokenToFromTokenRate: string;

  public isRevertedRate = false;

  public fromTokenAmountToGet: string;

  public toTokenAmountToGet: string;

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
    private dialog: MatDialog,
    private readonly translateService: TranslateService,
    private readonly withRoundPipe: WithRoundPipe,
    private readonly providerConnector: ProviderConnectorService,
    private readonly errorsService: ErrorsOldService
  ) {}

  public ngAfterViewInit(): void {
    try {
      this.checkProviderSettings();
    } catch (err) {
      this.showErrorMessage(err);
    }

    this.currentUrl = `https://rubic.exchange${this.router.url}`;

    const uniqueLink = this.route.snapshot.params.unique_link;
    this.setTradeData(uniqueLink);

    this.onAddressChanges = this.providerConnector.$addressChange;
  }

  ngOnDestroy(): void {
    this._tokensSubscription$?.unsubscribe();
  }

  private checkProviderSettings() {
    if (!this.providerConnector.isProviderActive) {
      this.errorsService.throw(new WalletError());
    }

    if (!this.providerConnector.address) {
      this.errorsService.throw(new AccountError());
    }
  }

  private showErrorMessage(err: RubicError): void {
    this.errorsService.showErrorDialog(err);
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

          const foundFromToken = this.tokens.find(
            t => t.address.toLowerCase() === this.tradeData.token.from.address.toLowerCase()
          );
          if (foundFromToken) {
            this.tradeData.token.from = { ...this.tradeData.token.from, ...foundFromToken };
          }

          const foundToToken = this.tokens.find(
            t => t.address.toLowerCase() === this.tradeData.token.to.address.toLowerCase()
          );
          if (foundToToken) {
            this.tradeData.token.to = { ...this.tradeData.token.to, ...foundToToken };
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
    // this.tradeData = { ...(await this.orderBookTradeService.setStatus(this.tradeData)) };
    // this.tradeData = { ...(await this.orderBookTradeService.setAllowance(this.tradeData)) };
    // this.tradeData = { ...(await this.orderBookTradeService.setAmountContributed(this.tradeData)) };
    // this.tradeData = { ...(await this.orderBookTradeService.setInvestorsNumber(this.tradeData)) };

    setTimeout(() => this.setDynamicData(), 10000);
  }

  private setExpirationDate(): void {
    const { expirationDate } = this.tradeData;
    this.expirationDay = expirationDate.format('DD.MM.YYYY');
    this.expirationTime = expirationDate.format('HH:mm');
  }

  private calculateRate(): void {
    this.fromTokenToToTokenRate = new BigNumber(
      this.withRoundPipe.transform(
        this.tradeData.token.from.amountTotal.div(this.tradeData.token.to.amountTotal).toFixed(),
        'toClosestValue',
        this.tradeData.token.from.decimals
      )
    ).toFormat(BIG_NUMBER_FORMAT);

    this.toTokenToFromTokenRate = new BigNumber(
      this.withRoundPipe.transform(
        this.tradeData.token.to.amountTotal.div(this.tradeData.token.from.amountTotal).toFixed(),
        'toClosestValue',
        this.tradeData.token.to.decimals
      )
    ).toFormat(BIG_NUMBER_FORMAT);
  }

  public getRate(): string {
    if (!this.isRevertedRate) {
      return `${this.fromTokenToToTokenRate} ${this.tradeData.token.from.symbol} / 1 ${this.tradeData.token.to.symbol}`;
    }
    return `1 ${this.tradeData.token.from.symbol} / ${this.toTokenToFromTokenRate} ${this.tradeData.token.to.symbol}`;
  }

  public calculateAmountToGet(value: string, tokenPart: TokenPart): void {
    value = value.split(',').join('');
    if (tokenPart === 'from') {
      this.toTokenAmountToGet = new BigNumber(value)
        .times(this.toTokenToFromTokenRate)
        .div(100)
        .times(100 - this.tradeData.token.to.brokerPercent)
        .dp(4)
        .toFormat(BIG_NUMBER_FORMAT);
    } else {
      this.fromTokenAmountToGet = new BigNumber(value)
        .times(this.fromTokenToToTokenRate)
        .div(100)
        .times(100 - this.tradeData.token.from.brokerPercent)
        .dp(4)
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
