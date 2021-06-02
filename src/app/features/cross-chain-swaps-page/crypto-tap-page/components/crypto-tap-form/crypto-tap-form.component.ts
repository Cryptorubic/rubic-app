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
import { CryptoTapService } from 'src/app/features/cross-chain-swaps-page/crypto-tap-page/services/crypto-tap-service/crypto-tap.service';
import {
  CRYPTO_TAP_TRADE_STATUS,
  CryptoTapToken,
  CryptoTapTrade
} from 'src/app/features/cross-chain-swaps-page/crypto-tap-page/models/CryptoTapTrade';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { coingeckoTestTokens } from 'src/test/tokens/coingecko-tokens';
import { MatDialog } from '@angular/material/dialog';
import { ErrorsService } from 'src/app/core/services/errors/errors.service';
import BigNumber from 'bignumber.js';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { BridgeBlockchain } from 'src/app/features/cross-chain-swaps-page/bridge-page/models/BridgeBlockchain';

interface ToTokens {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: SwapToken;
  [BLOCKCHAIN_NAME.POLYGON]: SwapToken;
}

@Component({
  selector: 'app-crypto-tap-form',
  templateUrl: './crypto-tap-form.component.html',
  styleUrls: ['./crypto-tap-form.component.scss']
})
export class CryptoTapFormComponent implements OnInit, OnDestroy {
  private readonly RBC_ETHEREUM_ADDRESS = '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3';

  private readonly RBC_KOVAN_ADDRESS = '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9';

  public BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public CRYPTO_TAP_TRADE_STATUS = CRYPTO_TAP_TRADE_STATUS;

  public blockchainsList = Object.values(BLOCKCHAINS);

  public fromBlockchain = BLOCKCHAINS[BLOCKCHAIN_NAME.ETHEREUM];

  public toBlockchainsList = [
    BLOCKCHAINS[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN],
    BLOCKCHAINS[BLOCKCHAIN_NAME.POLYGON]
  ];

  public toBlockchain = BLOCKCHAINS[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];

  public cryptoTapTrade = {} as CryptoTapTrade;

  public cryptoTapTokens: {
    [key: string]: CryptoTapToken;
  };

  public tradeSuccessId: string;

  public fromTokensList: List<SwapToken>;

  public toTokens = {} as ToTokens;

  private _tokensSubscription$: Subscription;

  public walletAddress: string;

  private _walletAddressSubscription$: Subscription;

  private isTestingMode: boolean;

  constructor(
    private tokensService: TokensService,
    private web3PrivateService: Web3PrivateService,
    private web3PublicService: Web3PublicService,
    private cryptoTapService: CryptoTapService,
    private dialog: MatDialog,
    private errorsService: ErrorsService,
    useTestingModeService: UseTestingModeService
  ) {
    useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      this.isTestingMode = isTestingMode;
      if (isTestingMode) {
        this.fromTokensList = List(
          coingeckoTestTokens.filter(
            token =>
              token.blockchain === BLOCKCHAIN_NAME.ETHEREUM &&
              (token.address === NATIVE_TOKEN_ADDRESS || token.address === this.RBC_KOVAN_ADDRESS)
          )
        );
        this.setCryptoTapTokens();
      }
    });
  }

  ngOnInit() {
    this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
      this.fromTokensList = tokens.filter(
        token =>
          token.blockchain === BLOCKCHAIN_NAME.ETHEREUM &&
          (token.address === NATIVE_TOKEN_ADDRESS ||
            token.address === this.RBC_ETHEREUM_ADDRESS ||
            (this.isTestingMode && token.address === this.RBC_KOVAN_ADDRESS))
      );
      this.setCryptoTapTokens();

      this.toTokens = {
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.findNativeToken(
          BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
          tokens
        ),
        [BLOCKCHAIN_NAME.POLYGON]: this.findNativeToken(BLOCKCHAIN_NAME.POLYGON, tokens)
      };
      this.cryptoTapTrade.toToken = this.toTokens[this.toBlockchain.key];
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

  private findNativeToken(blockchain: BLOCKCHAIN_NAME, tokens: List<SwapToken>): SwapToken {
    return tokens.find(
      token =>
        token.blockchain === blockchain &&
        this.web3PublicService[blockchain].isNativeAddress(token.address)
    );
  }

  private setCryptoTapTokens() {
    if (!this.fromTokensList.size) return;

    this.cryptoTapTrade.status = CRYPTO_TAP_TRADE_STATUS.CALCULATION;
    this.cryptoTapTokens = {};
    this.fromTokensList.forEach(swapToken => {
      this.cryptoTapTokens[swapToken.symbol] = {
        ...swapToken,
        fromAmount: '',
        toAmount: '',
        fee: ''
      };

      this.cryptoTapService.getEstimatedAmount(swapToken).subscribe(
        cryptoTapToken => {
          this.cryptoTapTokens[swapToken.symbol] = cryptoTapToken;
          if (this.cryptoTapTrade.fromToken?.symbol === swapToken.symbol) {
            this.cryptoTapTrade.fromToken = cryptoTapToken;
          }
        },
        err => {
          console.debug(err);
          this.errorsService.showErrorDialog(err, this.dialog);
        },
        () => {
          this.cryptoTapTrade.status = CRYPTO_TAP_TRADE_STATUS.WAITING;
        }
      );
    });
  }

  public onFromTokenChanges(inputToken: InputToken | null): void {
    if (inputToken) {
      this.cryptoTapTrade.fromToken = this.cryptoTapTokens[inputToken.symbol];
    } else {
      this.cryptoTapTrade = {
        ...this.cryptoTapTrade,
        fromToken: null
      };
    }
  }

  public onToBlockchainChanges(blockchain: BridgeBlockchain): void {
    this.toBlockchain = blockchain;
    this.cryptoTapTrade.toToken = this.toTokens[this.toBlockchain.key];
  }

  public getFeePrice(amount: string, price: number): BigNumber {
    return new BigNumber(amount).multipliedBy(price);
  }

  public getFeesDifferencePercent(): BigNumber {
    if (this.cryptoTapTokens.ETH?.fee && this.cryptoTapTokens.RBC?.fee) {
      const ethFee = this.getFeePrice(this.cryptoTapTokens.ETH.fee, this.cryptoTapTokens.ETH.price);
      const rbcFee = this.getFeePrice(this.cryptoTapTokens.RBC.fee, this.cryptoTapTokens.RBC.price);
      return ethFee.minus(rbcFee).div(ethFee).multipliedBy(100);
    }
    return undefined;
  }

  public switchToRbc(): void {
    this.cryptoTapTrade.fromToken = this.cryptoTapTokens.RBC;
  }

  public createTrade(): void {
    this.cryptoTapTrade.status = CRYPTO_TAP_TRADE_STATUS.CALCULATION;
    this.cryptoTapService
      .createTrade(this.cryptoTapTrade, () => {
        this.cryptoTapTrade.status = CRYPTO_TAP_TRADE_STATUS.TX_IN_PROGRESS;
      })
      .then(transactionHash => {
        this.cryptoTapTrade.status = CRYPTO_TAP_TRADE_STATUS.COMPLETED;
        this.tradeSuccessId = transactionHash;
      })
      .catch(err => {
        console.debug(err);
        this.cryptoTapTrade.status = CRYPTO_TAP_TRADE_STATUS.WAITING;
        this.errorsService.showErrorDialog(err, this.dialog);
      });
  }
}
