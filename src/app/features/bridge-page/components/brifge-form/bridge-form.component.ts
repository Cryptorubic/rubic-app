import { Component, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import BigNumber from 'bignumber.js';

import { BridgeService } from 'src/app/features/bridge-page/services/bridge.service';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import InputToken from '../../../../shared/models/tokens/InputToken';
import { BridgeToken } from '../../models/BridgeToken';
import { BridgeBlockchain } from '../../models/BridgeBlockchain';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { MessageBoxComponent } from '../../../../shared/components/message-box/message-box.component';
import { MetamaskError } from '../../../../shared/models/errors/provider/MetamaskError';
import { NetworkErrorComponent } from '../../../../shared/components/network-error/network-error.component';
import { BridgeTrade } from '../../models/BridgeTrade';

type Blockchains = {
  [BLOCKCHAIN_NAME.ETHEREUM]: BridgeBlockchain;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: BridgeBlockchain;
  [BLOCKCHAIN_NAME.POLYGON]: BridgeBlockchain;
};

@Component({
  selector: 'app-bridge-form',
  templateUrl: './bridge-form.component.html',
  styleUrls: ['./bridge-form.component.scss']
})
export class BridgeFormComponent implements OnInit, OnDestroy {
  public readonly BLOCKCHAINS: Blockchains = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      key: BLOCKCHAIN_NAME.ETHEREUM,
      label: 'ETH',
      name: 'Ethereum',
      shortedName: 'Ethereum',
      img: 'eth.png',
      baseUrl: 'https://etherscan.io',
      addressBaseUrl: 'https://etherscan.io/address/',
      scanner: {
        label: 'Etherscan',
        baseUrl: 'https://etherscan.io/token/'
      }
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      key: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      label: 'BSC',
      name: 'Binance Smart Chain',
      shortedName: 'BSC',
      img: 'bnb.svg',
      baseUrl: 'https://bscscan.com',
      addressBaseUrl: 'https://bscscan.com/address/',
      scanner: {
        label: 'BSCscan',
        baseUrl: 'https://bscscan.com/token/'
      }
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      key: BLOCKCHAIN_NAME.POLYGON,
      label: 'POLYGON',
      name: 'Polygon',
      shortedName: 'Polygon',
      img: 'polygon.svg',
      baseUrl: 'https://explorer-mainnet.maticvigil.com/',
      addressBaseUrl: 'https://explorer-mainnet.maticvigil.com/address/',
      scanner: {
        label: 'Mainnet',
        baseUrl: 'https://explorer-mainnet.maticvigil.com/address/'
      }
    }
  };

  public BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public readonly BRBC_ADDRESS = '0x8E3BCC334657560253B83f08331d85267316e08a';

  public blockchainsList: BridgeBlockchain[] = Object.values(this.BLOCKCHAINS);

  private _fromBlockchain = this.BLOCKCHAINS[BLOCKCHAIN_NAME.ETHEREUM];

  private _toBlockchain = this.BLOCKCHAINS[BLOCKCHAIN_NAME.POLYGON];

  private _tokens: List<BridgeToken> = List([]);

  public dropDownTokens: List<InputToken> = List([]);

  public _selectedToken: BridgeToken = null;

  public selectedTokenAsInputToken: InputToken = null;

  public _fromNumber: BigNumber;

  private _fee: BigNumber;

  public _toNumber: BigNumber;

  public feeCalculationProgress: boolean = false;

  public buttonAnimation: boolean = false;

  public tradeInProgress: boolean = false;

  public tradeSuccessId: string;

  public fromWalletAddress: string;

  public toWalletAddress: string;

  public isAdvancedSectionShown = false;

  private tokensSubscription$: Subscription;

  private addressSubscription$: Subscription;

  public isHighGasPriceModalShown = false;

  public isPolygonToEthTradeModalShown = false;

  get tokens(): List<BridgeToken> {
    return this._tokens;
  }

  set tokens(tokens: List<BridgeToken>) {
    this._tokens = tokens;
    this.updateDropDownTokens();
  }

  private updateDropDownTokens(): void {
    this.dropDownTokens = this._tokens.map(token => ({
      address: token.blockchainToken[this.fromBlockchain.key].address,
      name: token.blockchainToken[this.fromBlockchain.key].name,
      symbol: token.blockchainToken[this.fromBlockchain.key].symbol,
      image: token.image,
      decimals: token.blockchainToken[this.fromBlockchain.key].decimals
    }));
  }

  get selectedToken(): BridgeToken {
    return this._selectedToken;
  }

  set selectedToken(value: BridgeToken) {
    this._selectedToken = value;
    this.selectedTokenAsInputToken = this.dropDownTokens.find(
      token =>
        token.address === this.selectedToken?.blockchainToken[this.fromBlockchain.key].address
    );
  }

  get fromBlockchain() {
    return this._fromBlockchain;
  }

  set fromBlockchain(blockchain) {
    if (blockchain === this._toBlockchain) {
      this.revertBlockchains();
    } else {
      this._fromBlockchain = blockchain;
      if (this._fromBlockchain.key !== BLOCKCHAIN_NAME.ETHEREUM) {
        this._toBlockchain = this.BLOCKCHAINS[BLOCKCHAIN_NAME.ETHEREUM];
      }
      this.selectedToken = null;
      this.bridgeService.setNonEthereumBlockchain(this.getNonEthereumBlockchain()).then(() => {
        this.updateDropDownTokens();
      });
    }
  }

  get toBlockchain() {
    return this._toBlockchain;
  }

  set toBlockchain(blockchain) {
    if (blockchain === this._fromBlockchain) {
      this.revertBlockchains();
    } else {
      this._toBlockchain = blockchain;
      if (this._toBlockchain.key !== BLOCKCHAIN_NAME.ETHEREUM) {
        this._fromBlockchain = this.BLOCKCHAINS[BLOCKCHAIN_NAME.ETHEREUM];
      }
      this.selectedToken = null;
      this.bridgeService.setNonEthereumBlockchain(this.getNonEthereumBlockchain()).then(() => {
        this.updateDropDownTokens();
      });
    }
  }

  set fromNumber(fromNumber: BigNumber) {
    this._fromNumber = fromNumber;
    this.setToNumber();
  }

  get fromNumber(): BigNumber {
    return this._fromNumber;
  }

  set fee(fee: BigNumber) {
    this._fee = fee;
    this.setToNumber();
  }

  get fee(): BigNumber {
    return this._fee;
  }

  get toNumber(): string {
    if (this._toNumber === undefined || null) {
      return '';
    }

    if (!this.selectedToken) {
      this._toNumber = null;
      return '';
    }

    let amount = this._toNumber.toString();

    if (amount.includes('.')) {
      const startIndex = amount.indexOf('.') + 1;
      amount = amount.slice(
        0,
        startIndex + this.selectedToken.blockchainToken[this.toBlockchain.key].decimals
      );
    }

    return amount;
  }

  private setToNumber(): void {
    if (this.fromNumber !== undefined && this.fee !== undefined) {
      this._toNumber = this.fromNumber.minus(this.fee);
    } else {
      this._toNumber = undefined;
    }
  }

  constructor(private bridgeService: BridgeService, private dialog: MatDialog) {}

  ngOnInit() {
    this.bridgeService.setNonEthereumBlockchain(this.getNonEthereumBlockchain());
    this.tokensSubscription$ = this.bridgeService.tokens.subscribe(tokens => {
      this.tokens = tokens;
    });
    this.addressSubscription$ = this.bridgeService.walletAddress.subscribe(address => {
      this.fromWalletAddress = address;
      this.toWalletAddress = address;
    });
  }

  ngOnDestroy() {
    this.tokensSubscription$.unsubscribe();
    this.addressSubscription$.unsubscribe();
  }

  private getNonEthereumBlockchain(): BLOCKCHAIN_NAME {
    return this.fromBlockchain.key !== BLOCKCHAIN_NAME.ETHEREUM
      ? this.fromBlockchain.key
      : this.toBlockchain.key;
  }

  public revertBlockchains(): void {
    [this._fromBlockchain, this._toBlockchain] = [this._toBlockchain, this._fromBlockchain];
    this.updateDropDownTokens();
    if (this.selectedToken) {
      this.changeSelectedToken(this.selectedToken);
    }
  }

  private changeSelectedToken(token: BridgeToken): void {
    this.fee = undefined;
    this.selectedToken = token;
    if (!token) {
      return;
    }

    this.feeCalculationProgress = true;
    this.bridgeService
      .getFee(
        this.selectedToken.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].address,
        this.toBlockchain.key
      )
      .pipe(first())
      .subscribe(
        fee => {
          this.fee = new BigNumber(fee);
        },
        err => console.error(err),
        () => {
          this.feeCalculationProgress = false;
        }
      );
  }

  public onSelectedTokenChanges(inputToken: InputToken | null): void {
    if (inputToken) {
      const bridgeToken = this.tokens.find(
        token => token.blockchainToken[this.fromBlockchain.key].address === inputToken.address
      );
      this.changeSelectedToken(bridgeToken);
    } else {
      this.changeSelectedToken(null);
    }
  }

  public onTokensNumberChanges(tokensNumber: number | string): void {
    if (tokensNumber) {
      this.fromNumber = new BigNumber(tokensNumber);
    }
  }

  public checkAndConfirm(): void {
    this.buttonAnimation = true;
    if (
      this.fromBlockchain.key === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN &&
      this.toBlockchain.key === BLOCKCHAIN_NAME.ETHEREUM &&
      this.selectedToken.blockchainToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]?.address ===
        this.BRBC_ADDRESS
    ) {
      this.bridgeService.checkIfEthereumGasPriceIsHigh().subscribe(isHigh => {
        if (isHigh) {
          this.isHighGasPriceModalShown = true;
        } else {
          this.onConfirm();
        }
      });
    } else if (
      this.fromBlockchain.key === BLOCKCHAIN_NAME.POLYGON &&
      this.toBlockchain.key === BLOCKCHAIN_NAME.ETHEREUM
    ) {
      this.isPolygonToEthTradeModalShown = true;
    } else {
      this.onConfirm();
    }
  }

  public onHighGasPriceCancel() {
    this.isHighGasPriceModalShown = false;
    this.buttonAnimation = false;
  }

  public onHighGasPriceConfirm() {
    this.isHighGasPriceModalShown = false;
    this.onConfirm();
  }

  public onPolygonToEthTradeCancel(): void {
    this.isPolygonToEthTradeModalShown = false;
    this.buttonAnimation = false;
  }

  public onPolygonToEthTradeConfirm(): void {
    this.isPolygonToEthTradeModalShown = false;
    this.onConfirm();
  }

  public onConfirm(): void {
    const bridgeTrade: BridgeTrade = {
      token: this.selectedToken,
      fromBlockchain: this.fromBlockchain.key,
      toBlockchain: this.toBlockchain.key,
      amount: this.fromNumber,
      toAddress: this.toWalletAddress,
      onTransactionHash: () => {
        this.tradeInProgress = true;
      }
    };
    this.bridgeService
      .createTrade(bridgeTrade)
      .pipe(first())
      .subscribe(
        (res: string) => {
          this.tradeSuccessId = res;
          this.tradeInProgress = false;
          this.buttonAnimation = false;
        },
        err => {
          this.tradeInProgress = false;
          this.buttonAnimation = false;
          if (!(err instanceof RubicError)) {
            err = new RubicError();
          }
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
      );
  }

  public changeToWalletAddress(newAddress: string): void {
    this.toWalletAddress = newAddress;
  }
}
