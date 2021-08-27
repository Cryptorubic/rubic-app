import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { BridgeTokenPairsByBlockchains } from 'src/app/features/bridge/models/BridgeTokenPairsByBlockchains';
import { combineLatest, Observable, Subject } from 'rxjs';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { REFRESH_BUTTON_STATUS } from 'src/app/shared/components/rubic-refresh-button/rubic-refresh-button.component';
import { startWith, takeUntil } from 'rxjs/operators';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { List } from 'immutable';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { CrossChainRoutingService } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { InstantTradeService } from 'src/app/features/instant-trade/services/instant-trade-service/instant-trade.service';

type TokenType = 'from' | 'to';

type SelectedToken = {
  [tokenType in TokenType]: TokenAmount;
};

type AvailableTokens = {
  [tokenType in TokenType]: AvailableTokenAmount[];
};

@Component({
  selector: 'app-swaps-form',
  templateUrl: './swaps-form.component.html',
  styleUrls: ['./swaps-form.component.scss'],
  providers: [TuiDestroyService]
})
export class SwapsFormComponent implements OnInit {
  public isLoading = true;

  public autoRefresh: boolean;

  public allowRefresh: boolean = true;

  public onRefreshTrade = new Subject<void>();

  private _supportedTokens: List<TokenAmount>;

  private _bridgeTokenPairsByBlockchainsArray: List<BridgeTokenPairsByBlockchains>;

  public availableTokens: AvailableTokens;

  public selectedToken: SelectedToken;

  private _loadingStatus = REFRESH_BUTTON_STATUS.STOPPED;

  public fromBlockchain: BLOCKCHAIN_NAME;

  public toBlockchain: BLOCKCHAIN_NAME;

  public swapType: SWAP_PROVIDER_TYPE;

  public isMobile$: Observable<boolean>;

  public get isInstantTrade(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }

  public get isBridge(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.BRIDGE;
  }

  public get isCrossChainRouting(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
  }

  public get allowTrade(): boolean {
    const form = this.swapFormService.inputValue;
    return Boolean(
      form.fromAmount &&
        form.fromAmount.gt(0) &&
        form.fromBlockchain &&
        form.toBlockchain &&
        form.fromToken &&
        form.toToken
    );
  }

  public get loadingStatus(): REFRESH_BUTTON_STATUS {
    return this._loadingStatus;
  }

  public set loadingStatus(status: REFRESH_BUTTON_STATUS) {
    this._loadingStatus = status;
    this.cdr.detectChanges();
  }

  constructor(
    private readonly swapsService: SwapsService,
    public readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore,
    private readonly destroy$: TuiDestroyService
  ) {
    this.availableTokens = {
      from: [],
      to: []
    };
    this.selectedToken = {
      from: undefined,
      to: undefined
    };
    this.isMobile$ = this.headerStore.getMobileDisplayStatus();
  }

  ngOnInit(): void {
    this.subscribeOnTokens();

    this.subscribeOnSettings();

    this.swapsService.swapMode$.pipe(takeUntil(this.destroy$)).subscribe(swapMode => {
      this.swapType = swapMode;
      if (swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
        this.autoRefresh = this.settingsService.instantTradeValue.autoRefresh;
      } else {
        this.autoRefresh = this.settingsService.crossChainRoutingValue.autoRefresh;
      }
    });

    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        this.setFormValues(form);
      });
  }

  private subscribeOnTokens(): void {
    combineLatest([
      this.swapsService.availableTokens,
      this.swapsService.bridgeTokenPairsByBlockchainsArray
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([supportedTokens, bridgeTokenPairsByBlockchainsArray]) => {
        this.isLoading = true;
        if (!supportedTokens) {
          return;
        }

        this._supportedTokens = supportedTokens;
        this._bridgeTokenPairsByBlockchainsArray = bridgeTokenPairsByBlockchainsArray;

        this.callFunctionWithTokenTypes(this.setAvailableTokens.bind(this));
        this.callFunctionWithTokenTypes(this.setTokenWithBalance.bind(this));

        this.isLoading = false;
      });
  }

  private subscribeOnSettings(): void {
    combineLatest([
      this.settingsService.instantTradeValueChanges.pipe(
        startWith(this.settingsService.instantTradeValue)
      ),
      this.settingsService.crossChainRoutingValueChanges.pipe(
        startWith(this.settingsService.crossChainRoutingValue)
      )
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([instantTradeSettings, crossChainRoutingSettings]) => {
        if (this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
          this.autoRefresh = instantTradeSettings.autoRefresh;
        } else {
          this.autoRefresh = crossChainRoutingSettings.autoRefresh;
        }
      });
  }

  private setFormValues(form: SwapFormInput): void {
    this.fromBlockchain = form.fromBlockchain;
    this.toBlockchain = form.toBlockchain;

    if (this._supportedTokens) {
      this.callFunctionWithTokenTypes(this.setAvailableTokens.bind(this));

      this.selectedToken['from'] = form.fromToken;
      this.selectedToken['to'] = form.toToken;
      this.callFunctionWithTokenTypes(this.setTokenWithBalance.bind(this));
    }
  }

  private callFunctionWithTokenTypes(functionToCall: (tokenType: TokenType) => void): void {
    functionToCall('from');
    functionToCall('to');
  }

  private setAvailableTokens(tokenType: TokenType): void {
    const oppositeTokenKey = tokenType === 'from' ? 'toToken' : 'fromToken';
    const oppositeToken = this.swapFormService.inputValue[oppositeTokenKey];

    if (!oppositeToken) {
      this.availableTokens[tokenType] = this._supportedTokens
        .map(supportedToken => ({
          ...supportedToken,
          available: true
        }))
        .toArray();
    } else {
      const tokens: AvailableTokenAmount[] = [];
      const blockchainKey = tokenType === 'from' ? 'fromBlockchain' : 'toBlockchain';
      const oppositeBlockchainKey = tokenType === 'from' ? 'toBlockchain' : 'fromBlockchain';

      const checkIsEqualTokenAndPush = (supportedToken: TokenAmount): void => {
        tokens.push({
          ...supportedToken,
          available:
            supportedToken.blockchain !== oppositeToken.blockchain ||
            supportedToken.address.toLowerCase() !== oppositeToken.address.toLowerCase()
        });
      };

      const checkIsBridgeTokenPairAndPush = (supportedToken: TokenAmount): void => {
        const isAvailable = !!this._bridgeTokenPairsByBlockchainsArray
          .find(
            pairsByBlockchains =>
              pairsByBlockchains[oppositeBlockchainKey] === oppositeToken.blockchain &&
              pairsByBlockchains[blockchainKey] === supportedToken.blockchain
          )
          ?.tokenPairs.find(
            tokenPair =>
              tokenPair.tokenByBlockchain[oppositeToken.blockchain].address.toLowerCase() ===
                oppositeToken.address.toLowerCase() &&
              tokenPair.tokenByBlockchain[supportedToken.blockchain].address.toLowerCase() ===
                supportedToken.address.toLowerCase()
          );
        tokens.push({
          ...supportedToken,
          available: isAvailable
        });
      };

      if (CrossChainRoutingService.isSupportedBlockchain(oppositeToken.blockchain)) {
        this._supportedTokens.forEach(supportedToken => {
          if (CrossChainRoutingService.isSupportedBlockchain(supportedToken.blockchain)) {
            checkIsEqualTokenAndPush(supportedToken);
          } else {
            checkIsBridgeTokenPairAndPush(supportedToken);
          }
        });
      } else if (InstantTradeService.isSupportedBlockchain(oppositeToken.blockchain)) {
        this._supportedTokens.forEach(supportedToken => {
          if (oppositeToken.blockchain === supportedToken.blockchain) {
            checkIsEqualTokenAndPush(supportedToken);
          } else {
            checkIsBridgeTokenPairAndPush(supportedToken);
          }
        });
      } else {
        this._supportedTokens.forEach(supportedToken =>
          checkIsBridgeTokenPairAndPush(supportedToken)
        );
      }

      this.availableTokens[tokenType] = tokens;
    }
  }

  private setTokenWithBalance(tokenType: TokenType): void {
    const token = this.selectedToken[tokenType];
    if (!token) {
      return;
    }

    const tokenWithBalance = this._supportedTokens.find(
      supportedToken =>
        supportedToken.blockchain === token.blockchain &&
        supportedToken.address.toLowerCase() === token.address.toLowerCase()
    );

    if (
      tokenWithBalance &&
      (!tokenWithBalance.amount.isNaN() || !token.amount.isNaN()) &&
      !tokenWithBalance.amount.eq(token.amount)
    ) {
      this.selectedToken[tokenType] = tokenWithBalance;

      const formKey = tokenType === 'from' ? 'fromToken' : 'toToken';
      this.swapFormService.input.patchValue({
        [formKey]: this.selectedToken[tokenType]
      });
    }
  }

  public async revert() {
    const formControls = this.swapFormService.commonTrade.controls;
    const { fromBlockchain, toBlockchain, fromToken, toToken } = formControls.input.value;
    const { toAmount } = formControls.output.value;
    const revertData = {
      toToken: fromToken,
      fromToken: toToken,
      toBlockchain: fromBlockchain,
      fromBlockchain: toBlockchain
    } as Partial<SwapFormInput>;
    if (toAmount && toAmount.gt(0)) {
      revertData.fromAmount = toAmount;
    }
    // Remove null control values.
    formControls.input.patchValue(revertData);
  }
}
