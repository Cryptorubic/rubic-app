import { Component, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import { Subscription } from 'rxjs';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { BLOCKCHAINS } from 'src/app/features/cross-chain-swaps-page/common/constants/BLOCKCHAINS';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import InputToken from 'src/app/shared/models/tokens/InputToken';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { GetBnbService } from 'src/app/features/cross-chain-swaps-page/get-bnb-page/services/get-bnb-service/get-bnb.service';
import {
  GET_BNB_TRADE_STATUS,
  GetBnbTrade
} from 'src/app/features/cross-chain-swaps-page/get-bnb-page/models/GetBnbTrade';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { coingeckoTestTokens } from 'src/test/tokens/coingecko-tokens';

@Component({
  selector: 'app-get-bnb-form',
  templateUrl: './get-bnb-form.component.html',
  styleUrls: ['./get-bnb-form.component.scss']
})
export class GetBnbFormComponent implements OnInit, OnDestroy {
  private readonly RBC_ETHEREUM_ADDRESS = '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3';

  private readonly RBC_KOVAN_ADDRESS = '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9';

  public BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public GET_BNB_TRADE_STATUS = GET_BNB_TRADE_STATUS;

  public NATIVE_TOKEN_ADDRESS = NATIVE_TOKEN_ADDRESS;

  public blockchainsList = Object.values(BLOCKCHAINS);

  public fromBlockchain = BLOCKCHAINS[BLOCKCHAIN_NAME.ETHEREUM];

  public toBlockchain = BLOCKCHAINS[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];

  public getBnbTrade: GetBnbTrade;

  public tradeSuccessId: string;

  public fromTokensList: List<SwapToken>;

  private _tokensSubscription$: Subscription;

  public walletAddress: string;

  private _walletAddressSubscription$: Subscription;

  private isTestingMode: boolean;

  constructor(
    private tokensService: TokensService,
    private web3PrivateService: Web3PrivateService,
    private getBnbService: GetBnbService,
    useTestingModeService: UseTestingModeService
  ) {
    useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      this.isTestingMode = isTestingMode;
      this.fromTokensList = List(
        coingeckoTestTokens.filter(
          token =>
            token.blockchain === BLOCKCHAIN_NAME.ETHEREUM &&
            (token.address === NATIVE_TOKEN_ADDRESS || token.address === this.RBC_KOVAN_ADDRESS)
        )
      );
    });
  }

  ngOnInit() {
    this.getBnbTrade = {
      fromAmount: '',
      toAmount: ''
    } as GetBnbTrade;

    this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
      this.fromTokensList = tokens.filter(
        token =>
          token.blockchain === BLOCKCHAIN_NAME.ETHEREUM &&
          (token.address === NATIVE_TOKEN_ADDRESS ||
            token.address === this.RBC_ETHEREUM_ADDRESS ||
            (this.isTestingMode && token.address === this.RBC_KOVAN_ADDRESS))
      );

      this.getBnbTrade.toToken = tokens.find(
        token =>
          token.blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN &&
          token.address === NATIVE_TOKEN_ADDRESS
      );
    });

    this._walletAddressSubscription$ = this.web3PrivateService.onAddressChanges.subscribe(
      address => {
        this.walletAddress = address;
      }
    );
  }

  ngOnDestroy() {
    this._tokensSubscription$.unsubscribe();
    this._walletAddressSubscription$.unsubscribe();
  }

  public onSelectedFromTokenChanges(inputToken: InputToken | null): void {
    if (inputToken) {
      this.getBnbTrade.fromToken = this.fromTokensList.find(
        token =>
          token.blockchain === this.fromBlockchain.key && token.address === inputToken.address
      );

      this.getBnbTrade.status = GET_BNB_TRADE_STATUS.CALCULATION;
      this.getBnbService.getEstimatedAmounts(this.getBnbTrade).subscribe(
        (trade: GetBnbTrade) => {
          this.getBnbTrade = {
            ...trade,
            status: GET_BNB_TRADE_STATUS.WAITING
          };
        },
        err => {
          console.debug(err);
          this.getBnbTrade.status = GET_BNB_TRADE_STATUS.WAITING;
        }
      );
    } else {
      this.getBnbTrade = {
        ...this.getBnbTrade,
        fromToken: null,
        fromAmount: '',
        toAmount: ''
      };
    }
  }

  public createTrade() {
    this.getBnbTrade.status = GET_BNB_TRADE_STATUS.CALCULATION;
    this.getBnbService
      .createTrade(this.getBnbTrade, () => {
        this.getBnbTrade.status = GET_BNB_TRADE_STATUS.TX_IN_PROGRESS;
      })
      .then(transactionHash => {
        this.getBnbTrade.status = GET_BNB_TRADE_STATUS.COMPLETED;
        this.tradeSuccessId = transactionHash;
      })
      .catch(err => {
        console.debug(err);
        this.getBnbTrade.status = GET_BNB_TRADE_STATUS.WAITING;
      });
  }
}
