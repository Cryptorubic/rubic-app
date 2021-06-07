import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import BigNumber from 'bignumber.js';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { WithRoundPipe } from 'src/app/shared/pipes/with-round.pipe';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/BIG_NUMBER_FORMAT';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import { ErrorsService } from 'src/app/core/services/errors/errors.service';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { Subscription } from 'rxjs';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { List } from 'immutable';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { OrderBookTradeService } from '../../services/order-book-trade.service';
import { ORDER_BOOK_TRADE_STATUS, OrderBookTradeData } from '../../models/trade-data';
import { TX_STATUS } from '../../models/TX_STATUS';

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

  public walletAddress: string;

  private _userSubscription$: Subscription;

  get tokens(): List<SwapToken> {
    return this._tokens;
  }

  set tokens(value) {
    this._tokens = value.filter(t => t.blockchain === this.tradeData.blockchain);
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly orderBookTradeService: OrderBookTradeService,
    private readonly orderBookApiService: OrderBookApiService,
    private readonly tokensService: TokensService,
    private readonly dialog: MatDialog,
    private readonly translateService: TranslateService,
    private readonly withRoundPipe: WithRoundPipe,
    private readonly authService: AuthService,
    private readonly errorsService: ErrorsService
  ) {}

  ngOnInit(): void {
    this.currentUrl = `https://rubic.exchange${this.router.url}`;

    const uniqueLink = this.route.snapshot.params.unique_link;
    this.setTradeData(uniqueLink);

    this._userSubscription$ = this.authService.getCurrentUser().subscribe(async user => {
      this.walletAddress = user?.address;
      if (this.walletAddress && this.tradeData) {
        this.tradeData = { ...(await this.orderBookTradeService.setAllowance(this.tradeData)) };
      }
    });
  }

  ngOnDestroy(): void {
    this._tokensSubscription$?.unsubscribe();
  }

  private setTradeData(uniqueLink: string): void {
    this.orderBookApiService.getTradeData(uniqueLink).subscribe(
      tradeData => {
        this.tradeData = tradeData;
        this.setStaticTradeData();
        this.setDynamicData();

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
    this.tradeData = { ...(await this.orderBookTradeService.setStatus(this.tradeData)) };
    this.tradeData = { ...(await this.orderBookTradeService.setAmountContributed(this.tradeData)) };
    this.tradeData = { ...(await this.orderBookTradeService.setInvestorsNumber(this.tradeData)) };

    if (this.walletAddress) {
      this.tradeData = { ...(await this.orderBookTradeService.setAllowance(this.tradeData)) };
    }

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
        this.tradeData.token.from,
        'toClosestValue'
      )
    ).toFormat(BIG_NUMBER_FORMAT);

    this.toTokenToFromTokenRate = new BigNumber(
      this.withRoundPipe.transform(
        this.tradeData.token.to.amountTotal.div(this.tradeData.token.from.amountTotal).toFixed(),
        this.tradeData.token.to,
        'toClosestValue'
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
        this.errorsService.showErrorDialog(err);
      });
  }
}
