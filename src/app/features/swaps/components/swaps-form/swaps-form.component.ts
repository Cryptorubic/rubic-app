import { ChangeDetectorRef, Component } from '@angular/core';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { SupportedTokensInfo } from 'src/app/features/swaps/models/SupportedTokensInfo';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-swaps-form',
  templateUrl: './swaps-form.component.html',
  styleUrls: ['./swaps-form.component.scss']
})
export class SwapsFormComponent {
  public blockchainsList = [
    {
      symbol: BLOCKCHAIN_NAME.ETHEREUM,
      name: 'Ethereum',
      chainImg: 'assets/images/icons/eth-logo.svg',
      id: 1
    },
    {
      symbol: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      name: 'Binance Smart Chain',
      chainImg: 'assets/images/icons/coins/bnb.svg',
      id: 56
    },
    {
      symbol: BLOCKCHAIN_NAME.POLYGON,
      name: 'Polygon',
      chainImg: 'assets/images/icons/coins/polygon.svg',
      id: 137
    },
    {
      symbol: BLOCKCHAIN_NAME.XDAI,
      name: 'XDai',
      chainImg: 'assets/images/icons/coins/xdai.svg',
      id: 100
    }
  ];

  get isInstantTrade(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }

  private _supportedTokens: SupportedTokensInfo;

  private _bridgeTokensPairs: BlockchainsBridgeTokens[];

  public availableTokens: {
    from: AvailableTokenAmount[];
    to: AvailableTokenAmount[];
  } = {
    from: [],
    to: []
  };

  public isLoading = true;

  constructor(
    private readonly swapsService: SwapsService,
    private readonly swapsFormService: SwapFormService,
    private readonly cdr: ChangeDetectorRef
  ) {
    combineLatest([
      this.swapsService.availableTokens,
      this.swapsService.bridgeTokensPairs
    ]).subscribe(([supportedTokens, bridgeTokensPairs]) => {
      this._supportedTokens = supportedTokens;
      this._bridgeTokensPairs = bridgeTokensPairs;

      this.setAvailableTokens('from');
      this.setAvailableTokens('to');
      this.isLoading = false;
    });

    this.swapsFormService.commonTrade.valueChanges.subscribe(() => {
      this.isLoading = true;
      this.setAvailableTokens('from');
      this.setAvailableTokens('to');
      this.isLoading = false;
    });
  }

  public setAvailableTokens(tokenType: 'from' | 'to'): void {
    const oppositeBlockchainName = tokenType === 'from' ? 'toBlockchain' : 'fromBlockchain';
    const oppositeBlockchain =
      this.swapsFormService.commonTrade.controls.input.value[oppositeBlockchainName];

    const oppositeTokenName = tokenType === 'from' ? 'toToken' : 'fromToken';
    const oppositeToken = this.swapsFormService.commonTrade.controls.input.value[oppositeTokenName];

    const tokens: AvailableTokenAmount[] = [];
    if (!oppositeToken) {
      Object.values(this.blockchainsList).forEach(blockchainItem => {
        const blockchain = blockchainItem.symbol;

        this._supportedTokens[oppositeBlockchain][blockchain].forEach(token => {
          tokens.push({
            ...token,
            available: true
          });
        });
      });
    } else {
      this._supportedTokens[oppositeBlockchain][oppositeBlockchain].forEach(token => {
        tokens.push({
          ...token,
          available:
            token.blockchain !== oppositeToken.blockchain ||
            token.address.toLowerCase() !== oppositeToken.address.toLowerCase()
        });
      });

      const tokensPairs = this._bridgeTokensPairs
        .filter(
          bridgeTokensPair =>
            bridgeTokensPair.fromBlockchain === oppositeBlockchain ||
            bridgeTokensPair.toBlockchain === oppositeBlockchain
        )
        .map(bridgeTokensPair =>
          bridgeTokensPair.bridgeTokens.find(
            bridgeToken =>
              bridgeToken.blockchainToken[oppositeBlockchain].address.toLowerCase() ===
              oppositeToken.address.toLowerCase()
          )
        )
        .filter(tokenPair => tokenPair);
      Object.values(this.blockchainsList).forEach(blockchainItem => {
        const blockchain = blockchainItem.symbol;
        if (oppositeBlockchain === blockchain) {
          return;
        }

        this._supportedTokens[oppositeBlockchain][blockchain].forEach(token => {
          const foundTokenPair = tokensPairs.find(
            bridgeToken =>
              bridgeToken.blockchainToken[blockchain]?.address.toLowerCase() ===
              token.address.toLowerCase()
          );

          tokens.push({
            ...token,
            available: !!foundTokenPair
          });
        });
      });
    }

    this.availableTokens[tokenType] = tokens;
  }
}
