import { Injectable, NgZone } from '@angular/core';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { BUTTON_ERROR_TYPE } from '@features/swaps/shared/components/swap-button-container/models/button-error-type';
import { BIG_NUMBER_FORMAT } from '@shared/constants/formats/big-number-format';
import BigNumber from 'bignumber.js';
import { WithRoundPipe } from '@shared/pipes/with-round.pipe';
import { BehaviorSubject, combineLatest, combineLatestWith, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { map } from 'rxjs/operators';
import {
  BlockchainsInfo,
  CHAIN_TYPE,
  ChainType,
  compareAddresses,
  EvmWeb3Pure,
  Web3Pure
} from 'rubic-sdk';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { isNil } from '@shared/utils/utils';
import { disabledFromBlockchains } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/constants/disabled-from-blockchains';
// import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import MinAmountError from '@core/errors/models/common/min-amount-error';
import MaxAmountError from '@core/errors/models/common/max-amount-error';
import { isMinimalToken, isTokenAmount } from '@shared/utils/is-token';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';

@Injectable()
export class SwapButtonContainerErrorsService {
  /**
   * Either contains error's text.
   */
  private readonly _errorBody$ = new BehaviorSubject<{
    type: BUTTON_ERROR_TYPE;
    text: string;
  }>(undefined);

  /**
   * True if checking of error is in progress.
   */
  private readonly _errorLoading$ = new BehaviorSubject<boolean>(false);

  public readonly errorLoading$ = this._errorLoading$.asObservable();

  public readonly error$: Observable<{
    type: BUTTON_ERROR_TYPE | null;
    text: string;
    loading: boolean;
  }> = combineLatest([this._errorBody$, this._errorLoading$]).pipe(
    map(([errorBody, loading]) => ({
      ...errorBody,
      loading
    }))
  );

  private errorType: Record<BUTTON_ERROR_TYPE, boolean> = Object.values(BUTTON_ERROR_TYPE).reduce(
    (acc, key) => ({
      ...acc,
      [key]: false
    }),
    {}
  ) as Record<BUTTON_ERROR_TYPE, boolean>;

  private minAmount: string;

  private minAmountTokenSymbol: string;

  private maxAmount: string;

  private maxAmountTokenSymbol: string;

  private translateSub$: Subscription;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly queryParamsService: QueryParamsService,
    private readonly withRoundPipe: WithRoundPipe,
    private readonly translateService: TranslateService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    // private readonly settingsService: SettingsService,
    private readonly ngZone: NgZone
  ) {
    this.subscribeOnSwapForm();
    this.subscribeOnSwapMode();
    this.subscribeOnWalletNetwork();
    this.subscribeOnAuth();
    this.subscribeOnTargetNetworkAddress();
    this.subscribeOnReceiverAndWallet();
  }

  private subscribeOnSwapForm(): void {
    this.swapFormService.inputValue$.subscribe(() => {
      this.checkAmounts();
      this.checkWalletSupportsFromBlockchain();
      this.checkSelectedToken();
      this.checkUserBlockchain();
      this.checkUserBalance();

      this.updateError();
    });

    this.swapFormService.outputValue$.subscribe(() => {
      this.checkAmounts();

      this.updateError();
    });
  }

  private subscribeOnSwapMode(): void {
    // this.swapTypeService.swapMode$.subscribe(swapMode => {
    //   if (swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
    //     this.setMinAmountError(false);
    //     this.setMaxAmountError(false);
    //   }
    // });
  }

  private subscribeOnWalletNetwork(): void {
    this.walletConnectorService.networkChange$.subscribe(() => {
      this.checkUserBlockchain();

      this.updateError();
    });
  }

  private subscribeOnAuth(): void {
    this.authService.currentUser$.subscribe(() => {
      this.checkWalletSupportsFromBlockchain();
      this.checkUserBalance();

      this.updateError();
    });
  }

  private subscribeOnTargetNetworkAddress(): void {
    combineLatest([
      this.targetNetworkAddressService.isAddressValid$
      // this.swapTypeService.swapMode$
      // this.settingsService.instantTradeValueChanges.pipe(
      //   startWith(this.settingsService.instantTradeValue)
      // ),
      // this.settingsService.crossChainRoutingValueChanges.pipe(
      //   startWith(this.settingsService.crossChainRoutingValue)
      // )
    ]).subscribe(([isAddressValid]) => {
      let isWithReceiverAddress = false;

      // switch (swapMode) {
      //   case SWAP_PROVIDER_TYPE.INSTANT_TRADE:
      //     isWithReceiverAddress = instantTradesSettingsForm.showReceiverAddress;
      //     break;
      //   case SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING:
      //     isWithReceiverAddress = crossChainSettingsForm.showReceiverAddress;
      //     break;
      // }

      this.errorType[BUTTON_ERROR_TYPE.INVALID_TARGET_ADDRESS] =
        isWithReceiverAddress && !isAddressValid;

      this.updateError();
    });
  }

  /**
   * Checks, that user entered all necessary amounts in form.
   */
  private checkAmounts(): void {
    const { fromAmount } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;
    this.errorType[BUTTON_ERROR_TYPE.NO_AMOUNT] = !fromAmount?.gt(0) || !toAmount?.gt(0);
  }

  /**
   * Checks that from blockchain can be used for current wallet.
   */
  private async checkWalletSupportsFromBlockchain(): Promise<void> {
    const fromAsset = this.swapFormService.inputValue.fromAsset;
    const isUserAddressCorrect = await EvmWeb3Pure.isAddressCorrect(this.authService.userAddress);
    if (!isMinimalToken(fromAsset)) {
      if (!fromAsset) {
        this.errorType[BUTTON_ERROR_TYPE.WRONG_WALLET] = false;
        return;
      }
      this.errorType[BUTTON_ERROR_TYPE.WRONG_WALLET] =
        Boolean(this.authService.userAddress) && !isUserAddressCorrect;
      return;
    }

    const chainType = BlockchainsInfo.getChainType(fromAsset.blockchain);
    const isAddressCorrectValue = Web3Pure[chainType].isAddressCorrect(
      this.authService.userAddress
    );

    this.errorType[BUTTON_ERROR_TYPE.WRONG_WALLET] =
      Boolean(this.authService.userAddress) &&
      (chainType === CHAIN_TYPE.EVM || chainType === CHAIN_TYPE.TRON) &&
      !isAddressCorrectValue;
  }

  /**
   * Checks that user's token's balance is enough for trade.
   * Can start error loading process, if balance is not yet calculated.
   */
  private checkUserBalance(): void {
    // if (this.swapTypeService.getSwapProviderType() === SWAP_PROVIDER_TYPE.LIMIT_ORDER) {
    //   this.errorType[BUTTON_ERROR_TYPE.INSUFFICIENT_FUNDS] = false;
    //   return;
    // }

    const { fromAsset, fromAmount } = this.swapFormService.inputValue;
    if (!isTokenAmount(fromAsset)) {
      this.errorType[BUTTON_ERROR_TYPE.INSUFFICIENT_FUNDS] = false;
      return;
    }

    let fromChainType: ChainType | undefined;
    try {
      fromChainType = BlockchainsInfo.getChainType(fromAsset.blockchain);
    } catch {}
    if (
      !fromAsset ||
      !this.authService.userAddress ||
      !fromChainType ||
      fromChainType !== this.authService.userChainType
    ) {
      this.errorType[BUTTON_ERROR_TYPE.INSUFFICIENT_FUNDS] = false;
      return;
    }

    if (fromAsset.amount?.isFinite()) {
      this._errorLoading$.next(false);
      this.errorType[BUTTON_ERROR_TYPE.INSUFFICIENT_FUNDS] = fromAsset.amount.lt(fromAmount);
    } else {
      this._errorLoading$.next(true);
    }
  }

  private checkSelectedToken(): void {
    this.errorType[BUTTON_ERROR_TYPE.NO_SELECTED_TOKEN] =
      isNil(this.swapFormService.inputValue?.fromAsset) &&
      isNil(this.queryParamsService.queryParams.from);
  }

  /**
   * Checks that user's selected blockchain is equal to from blockchain.
   */
  private checkUserBlockchain(): void {
    const { fromAsset } = this.swapFormService.inputValue;
    const userBlockchain = this.walletConnectorService.network;
    if (userBlockchain && isMinimalToken(fromAsset)) {
      let chainType: ChainType | undefined;
      try {
        chainType = BlockchainsInfo.getChainType(fromAsset.blockchain);
      } catch {}
      this.errorType[BUTTON_ERROR_TYPE.WRONG_BLOCKCHAIN] =
        chainType === CHAIN_TYPE.EVM && fromAsset.blockchain !== userBlockchain;
      this.errorType[BUTTON_ERROR_TYPE.WRONG_SOURCE_NETWORK] = disabledFromBlockchains.includes(
        fromAsset.blockchain
      );
    } else {
      this.errorType[BUTTON_ERROR_TYPE.WRONG_BLOCKCHAIN] = false;
    }
  }

  /**
   * Checks currently set errors and update errors subject.
   */
  public updateError(): void {
    this.translateSub$?.unsubscribe();

    let type: BUTTON_ERROR_TYPE | null = null;
    let translateParams: { key: string; interpolateParams?: object };
    const err = this.errorType;
    const { fromAssetType } = this.swapFormService.inputValue;
    const fromBlockchainLabel = BlockchainsInfo.isBlockchainName(fromAssetType)
      ? blockchainLabel[fromAssetType]
      : 'EVM';

    switch (true) {
      case err[BUTTON_ERROR_TYPE.ARGENT_WITHOUT_RECEIVER]: {
        type = BUTTON_ERROR_TYPE.ARGENT_WITHOUT_RECEIVER;
        translateParams = { key: 'Receiver address is required for swaps Argent wallet' };
        break;
      }
      case err[BUTTON_ERROR_TYPE.WRONG_SOURCE_NETWORK]: {
        type = BUTTON_ERROR_TYPE.WRONG_SOURCE_NETWORK;
        translateParams = {
          key: 'errors.wrongSourceNetwork',
          interpolateParams: {
            network: fromBlockchainLabel
          }
        };
        break;
      }
      // @TODO Solana. Remove after blockchain stabilization.
      case err[BUTTON_ERROR_TYPE.SOLANA_UNAVAILABLE]: {
        type = BUTTON_ERROR_TYPE.SOLANA_UNAVAILABLE;
        translateParams = {
          key: 'Solana is temporarily unavailable for Multi-Chain swaps.'
        };
        break;
      }
      case err[BUTTON_ERROR_TYPE.WRONG_WALLET]: {
        type = BUTTON_ERROR_TYPE.WRONG_WALLET;
        translateParams = {
          key: 'errors.wrongWallet',
          interpolateParams: {
            network: fromBlockchainLabel
          }
        };
        break;
      }
      case err[BUTTON_ERROR_TYPE.MULTICHAIN_WALLET]: {
        type = BUTTON_ERROR_TYPE.MULTICHAIN_WALLET;
        translateParams = { key: 'errors.multichainWallet' };
        break;
      }
      case err[BUTTON_ERROR_TYPE.NO_SELECTED_TOKEN]: {
        type = BUTTON_ERROR_TYPE.NO_SELECTED_TOKEN;
        translateParams = { key: 'errors.noSelectedToken' };
        break;
      }
      case err[BUTTON_ERROR_TYPE.WRONG_BLOCKCHAIN]: {
        type = BUTTON_ERROR_TYPE.WRONG_BLOCKCHAIN;
        translateParams = {
          key: 'errors.chooseNetworkWallet',
          interpolateParams: { blockchain: fromBlockchainLabel }
        };
        break;
      }
      case err[BUTTON_ERROR_TYPE.NO_AMOUNT]: {
        type = BUTTON_ERROR_TYPE.NO_AMOUNT;
        translateParams = { key: 'errors.noEnteredAmount' };
        break;
      }
      case err[BUTTON_ERROR_TYPE.LESS_THAN_MINIMUM]: {
        type = BUTTON_ERROR_TYPE.LESS_THAN_MINIMUM;
        translateParams = {
          key: 'errors.minimumAmount',
          interpolateParams: { amount: this.minAmount, token: this.minAmountTokenSymbol }
        };
        break;
      }
      case err[BUTTON_ERROR_TYPE.MORE_THAN_MAXIMUM]: {
        type = BUTTON_ERROR_TYPE.MORE_THAN_MAXIMUM;
        translateParams = {
          key: 'errors.maximumAmount',
          interpolateParams: { amount: this.maxAmount, token: this.maxAmountTokenSymbol }
        };
        break;
      }
      case err[BUTTON_ERROR_TYPE.INSUFFICIENT_FUNDS]: {
        type = BUTTON_ERROR_TYPE.INSUFFICIENT_FUNDS;
        translateParams = { key: 'errors.InsufficientBalance' };
        break;
      }
      case err[BUTTON_ERROR_TYPE.INVALID_TARGET_ADDRESS]: {
        type = BUTTON_ERROR_TYPE.INVALID_TARGET_ADDRESS;
        translateParams = { key: 'errors.invalidTargetAddress' };
        break;
      }
      case err[BUTTON_ERROR_TYPE.SOL_SWAP]: {
        type = BUTTON_ERROR_TYPE.SOL_SWAP;
        translateParams = { key: 'errors.solSwap' };
        break;
      }
      default:
    }

    const hasErrors = Object.values(err).filter(Boolean).length;
    if (hasErrors && !translateParams) {
      translateParams = { key: 'errors.unknown' };
    }
    if (!hasErrors && !translateParams) {
      this.ngZone.run(() => {
        this._errorBody$.next({
          type: null,
          text: ''
        });
      });
    } else {
      this.translateSub$ = this.translateService
        .stream(translateParams.key, translateParams.interpolateParams)
        .subscribe((text: string) => {
          this.ngZone.run(() => {
            this._errorBody$.next({
              type,
              text
            });
          });
        });
    }
  }

  public setMinAmountError(
    value: false | number | BigNumber | { amount: BigNumber; symbol: string }
  ): void {
    if (value) {
      const minAmount = typeof value === 'object' && 'amount' in value ? value.amount : value;
      if (typeof minAmount === 'number') {
        this.minAmount = minAmount.toString();
      } else {
        this.minAmount = this.withRoundPipe.transform(
          minAmount.toFormat(BIG_NUMBER_FORMAT),
          'toClosestValue'
        );
      }

      this.minAmountTokenSymbol =
        typeof value === 'object' && 'symbol' in value
          ? value.symbol
          : this.swapFormService.inputValue.fromAsset.symbol;

      this.errorType[BUTTON_ERROR_TYPE.LESS_THAN_MINIMUM] = true;
    } else {
      this.errorType[BUTTON_ERROR_TYPE.LESS_THAN_MINIMUM] = false;
    }
    this.updateError();
  }

  public setMaxAmountError(
    value: false | number | BigNumber | { amount: BigNumber; symbol: string }
  ): void {
    if (value) {
      const maxAmount = typeof value === 'object' && 'amount' in value ? value.amount : value;
      if (typeof maxAmount === 'number') {
        this.maxAmount = maxAmount.toString();
      } else {
        this.maxAmount = this.withRoundPipe.transform(
          maxAmount.toFormat(BIG_NUMBER_FORMAT),
          'toClosestValue',
          { roundingMode: BigNumber.ROUND_HALF_UP }
        );
      }

      this.maxAmountTokenSymbol =
        typeof value === 'object' && 'symbol' in value
          ? value.symbol
          : this.swapFormService.inputValue.fromAsset.symbol;

      this.errorType[BUTTON_ERROR_TYPE.MORE_THAN_MAXIMUM] = true;
    } else {
      this.errorType[BUTTON_ERROR_TYPE.MORE_THAN_MAXIMUM] = false;
    }
    this.updateError();
  }

  public setRubicError(error?: RubicError<ERROR_TYPE>): void {
    if (!error) {
      this.errorType[BUTTON_ERROR_TYPE.MORE_THAN_MAXIMUM] = false;
      this.errorType[BUTTON_ERROR_TYPE.LESS_THAN_MINIMUM] = false;
      this.updateError();
    } else if (error instanceof MinAmountError) {
      this.setMinAmountError({ amount: error.amount, symbol: error.tokenSymbol });
    } else if (error instanceof MaxAmountError) {
      this.setMaxAmountError({ amount: error.amount, symbol: error.tokenSymbol });
    }
  }

  private subscribeOnReceiverAndWallet(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        map(() => this.walletConnectorService.provider.walletName),
        combineLatestWith(this.targetNetworkAddressService.address$)
      )
      .subscribe(([wallet, receiver]) => {
        const isWalletAddress =
          receiver === null || compareAddresses(receiver, this.walletConnectorService.address);
        this.errorType[BUTTON_ERROR_TYPE.ARGENT_WITHOUT_RECEIVER] =
          wallet === WALLET_NAME.ARGENT && isWalletAddress;
      });
  }
}
