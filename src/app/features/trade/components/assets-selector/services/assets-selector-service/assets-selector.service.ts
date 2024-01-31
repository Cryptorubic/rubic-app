import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { BlockchainName } from 'rubic-sdk';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensNetworkService } from '@core/services/tokens/tokens-network.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { FormType } from '@features/trade/models/form-type';
import { Asset, AssetType } from '@features/trade/models/asset';
import { SelectorListType } from '@features/trade/components/assets-selector/models/selector-list-type';
import {
  blockchainsList,
  defaultBlockchainsList,
  notEvmChangeNowBlockchainsList
} from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { AssetsSelectorComponentInput } from '@features/trade/components/assets-selector/models/assets-selector-component-context';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

@Injectable()
export class AssetsSelectorService {
  private _formType: FormType;

  public get formType(): FormType {
    return this._formType;
  }

  private readonly _assetType$ = new BehaviorSubject<AssetType>(undefined);

  public readonly assetType$ = this._assetType$.asObservable();

  public get assetType(): AssetType {
    return this._assetType$.value;
  }

  private set assetType(value: AssetType) {
    this._assetType$.next(value);
  }

  private readonly _assetSelected$ = new Subject<Asset>();

  public readonly assetSelected$ = this._assetSelected$.asObservable();

  private readonly _selectorListType$ = new BehaviorSubject<SelectorListType>(undefined);

  public readonly selectorListType$ = this._selectorListType$.asObservable();

  public get selectorListType(): SelectorListType {
    return this._selectorListType$.value;
  }

  private set selectorListType(value: SelectorListType) {
    this._selectorListType$.next(value);
  }

  constructor(
    private readonly tokensStoreService: TokensStoreService,
    private readonly tokensNetworkService: TokensNetworkService,
    private readonly swapFormService: SwapsFormService,
    private readonly destroy$: TuiDestroyService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.subscribeOnAssetChange();
  }

  private isUserFirstNetworkSelection(
    fromBlockchain: BlockchainName,
    assetTypeKey: 'fromBlockchain' | 'toBlockchain'
  ): boolean {
    return (
      !fromBlockchain ||
      assetTypeKey !== 'toBlockchain' ||
      Boolean(
        assetTypeKey === 'toBlockchain' && fromBlockchain && this.swapFormService.inputValue.toToken
      ) ||
      fromBlockchain in notEvmChangeNowBlockchainsList
    );
  }

  public initParameters(context: Omit<AssetsSelectorComponentInput, 'idPrefix'>): void {
    this._formType = context.formType;

    const assetTypeKey = this.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
    const assetType = this.swapFormService.inputValue[assetTypeKey];
    const fromBlockchain =
      this.swapFormService.inputValue.fromToken &&
      'blockchain' in this.swapFormService.inputValue.fromToken
        ? this.swapFormService.inputValue.fromToken.blockchain
        : null;
    const userBlockchainName = defaultBlockchainsList.includes(this.walletConnectorService.network)
      ? this.walletConnectorService.network
      : blockchainsList[0].name;
    const userAvailableBlockchainName = blockchainsList.find(
      chain => chain.name === userBlockchainName
    )?.name;
    const toTokenSelected = this.swapFormService.inputValue.toToken;
    const fromTokenSelected = this.swapFormService.inputValue.fromToken;

    if (this.isUserFirstNetworkSelection(fromBlockchain, assetTypeKey)) {
      if (toTokenSelected) {
        this.assetType = assetType;
      } else {
        this.assetType = userAvailableBlockchainName || assetType;
      }
    } else {
      if (toTokenSelected || fromTokenSelected) {
        this.assetType = fromBlockchain;
      } else {
        this.assetType = userAvailableBlockchainName || fromBlockchain;
      }
    }

    this.selectorListType = 'tokens';
  }

  private subscribeOnAssetChange(): void {
    this.assetType$
      .pipe(filter(Boolean), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(assetType => {
        const assetKey = this.formType === 'from' ? 'fromBlockchain' : 'toToken';
        if (!this.swapFormService.inputValue[assetKey]) {
          const assetTypeKey = this.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
          if (this.swapFormService.inputValue[assetTypeKey] !== assetType) {
            this.swapFormService.inputControl.patchValue({
              [assetTypeKey]: this.assetType
            });
          }
        }

        this.checkAndRefetchTokenList();
      });
  }

  private checkAndRefetchTokenList(): void {
    if (this.tokensNetworkService.needRefetchTokens) {
      this.tokensNetworkService.tokensRequestParameters = undefined;
    }
  }

  public setSelectorListTypeByAssetType(): void {
    this.selectorListType = this.assetType === 'fiat' ? 'fiats' : 'tokens';
  }

  public openFiatsList(): void {
    this.assetType = 'fiat';
    this.selectorListType = 'fiats';
  }

  public openBlockchainsList(): void {
    this.selectorListType = 'blockchains';
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.assetType = blockchainName;
    this.tokensStoreService.startBalanceCalculating(blockchainName);
    this.selectorListType = 'tokens';
  }

  public onAssetSelect(asset: Asset): void {
    if (this._formType === 'from') {
      this.gtmService.fireSelectInputTokenEvent(asset.name);
    }
    if (this._formType === 'to') {
      this.gtmService.fireSelectOutputTokenEvent(asset.name);
    }
    this._assetSelected$.next(asset);
  }

  public getAssetType(formType: FormType): AssetType {
    const assetTypeKey = formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
    return this.swapFormService.inputValue[assetTypeKey];
  }
}
