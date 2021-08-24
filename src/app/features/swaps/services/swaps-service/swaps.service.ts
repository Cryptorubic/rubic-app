import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { SupportedTokensInfo } from 'src/app/features/swaps/models/SupportedTokensInfo';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';
import { debounceTime, first, startWith } from 'rxjs/operators';
import { BridgesSwapProviderService } from '../../../bridge/services/bridges-swap-provider-service/bridges-swap-provider.service';
import { InstantTradesSwapProviderService } from '../../../instant-trade/services/instant-trades-swap-provider-service/instant-trades-swap-provider.service';
import { SWAP_PROVIDER_TYPE } from '../../models/SwapProviderType';

@Injectable()
export class SwapsService {
  private _swapProviderType$ = new BehaviorSubject<SWAP_PROVIDER_TYPE>(undefined);

  private _availableTokens = new BehaviorSubject<SupportedTokensInfo>(undefined);

  private _bridgeTokensPairs = new BehaviorSubject<BlockchainsBridgeTokens[]>([]);

  get availableTokens(): Observable<SupportedTokensInfo> {
    return this._availableTokens.asObservable();
  }

  get bridgeTokensPairs(): Observable<BlockchainsBridgeTokens[]> {
    return this._bridgeTokensPairs.asObservable();
  }

  get swapMode$(): Observable<SWAP_PROVIDER_TYPE | null> {
    return this._swapProviderType$.asObservable();
  }

  get swapMode(): SWAP_PROVIDER_TYPE | null {
    return this._swapProviderType$.getValue();
  }

  constructor(
    private readonly bridgesSwapProvider: BridgesSwapProviderService,
    private readonly instantTradesSwapProvider: InstantTradesSwapProviderService,
    private readonly swapFormService: SwapFormService
  ) {
    combineLatest([this.bridgesSwapProvider.tokens, this.instantTradesSwapProvider.tokens])
      .pipe(debounceTime(0))
      .subscribe(([bridgesTokens, instantTradesTokens]) => {
        const tokens = { ...bridgesTokens };
        Object.keys(tokens).forEach(fromBlockchain => {
          Object.keys(tokens[fromBlockchain]).forEach(toBlockchain => {
            tokens[fromBlockchain][toBlockchain] = tokens[fromBlockchain][toBlockchain].concat(
              ...instantTradesTokens[toBlockchain][toBlockchain]
            );
          });
        });
        this._availableTokens.next(tokens);
      });
    this.bridgesSwapProvider.bridgeTokensPairs.subscribe(bridgeTokensPairs => {
      this._bridgeTokensPairs.next(bridgeTokensPairs);
    });

    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue))
      .subscribe(form => {
        const { fromBlockchain, toBlockchain, fromToken, toToken } = form;
        if (fromBlockchain === toBlockchain) {
          this._swapProviderType$.next(SWAP_PROVIDER_TYPE.INSTANT_TRADE);
        } else if (!fromToken || !toToken) {
          this._swapProviderType$.next(SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING);
        } else {
          this.bridgeTokensPairs.pipe(first()).subscribe(bridgeTokensPairs => {
            const foundBridgeToken = bridgeTokensPairs
              .find(
                tokensPairs =>
                  tokensPairs.fromBlockchain === fromBlockchain &&
                  tokensPairs.toBlockchain === toBlockchain
              )
              ?.bridgeTokens.find(
                bridgeToken =>
                  bridgeToken.blockchainToken[fromBlockchain].address.toLowerCase() ===
                    fromToken.address.toLowerCase() &&
                  bridgeToken.blockchainToken[toBlockchain].address.toLowerCase() ===
                    toToken.address.toLowerCase()
              );
            if (foundBridgeToken) {
              this._swapProviderType$.next(SWAP_PROVIDER_TYPE.BRIDGE);
            } else {
              this._swapProviderType$.next(SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING);
            }
          });
        }
      });
  }
}
