import { Injectable } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { SupportedTokensInfo } from 'src/app/features/swaps/models/SupportedTokensInfo';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';
import { InstantTradeService } from 'src/app/features/instant-trade/services/instant-trade-service/instant-trade.service';
import { debounceTime } from 'rxjs/operators';
import { SwapProvider } from '../swap-provider';
import { BridgesSwapProviderService } from '../../../bridge/services/bridges-swap-provider-service/bridges-swap-provider.service';
import { InstantTradesSwapProviderService } from '../../../instant-trade/services/instant-trades-swap-provider-service/instant-trades-swap-provider.service';
import { SWAP_PROVIDER_TYPE } from '../../models/SwapProviderType';

@Injectable()
export class SwapsService {
  private _swapProvider: SwapProvider;

  private _availableTokens;

  private _bridgeTokensPairs;

  get availableTokens(): Observable<SupportedTokensInfo> {
    return this._availableTokens.asObservable();
  }

  get bridgeTokensPairs(): Observable<BlockchainsBridgeTokens[]> {
    return this._bridgeTokensPairs.asObservable();
  }

  get swapMode(): SWAP_PROVIDER_TYPE | null {
    return this._swapProvider?.TYPE;
  }

  constructor(
    private readonly bridgesSwapProvider: BridgesSwapProviderService,
    private readonly instantTradesSwapProvider: InstantTradesSwapProviderService,
    private readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService
  ) {
    this._availableTokens = new Subject<SupportedTokensInfo>();
    this._bridgeTokensPairs = new Subject<BlockchainsBridgeTokens[]>();

    combineLatest([this.bridgesSwapProvider.tokens, this.instantTradesSwapProvider.tokens])
      .pipe(debounceTime(0))
      .subscribe(([bridgesTokens, instantTradesTokens]) => {
        const tokens = { ...bridgesTokens };
        Object.keys(tokens).forEach(fromBlockchain => {
          Object.keys(tokens[fromBlockchain]).forEach(toBlockchain => {
            tokens[fromBlockchain][toBlockchain] = tokens[fromBlockchain][toBlockchain].concat(
              ...instantTradesTokens[fromBlockchain][toBlockchain]
            );
          });
        });
        this._availableTokens.next(tokens);
      });
    this.bridgesSwapProvider.bridgeTokensPairs.subscribe(bridgeTokensPairs => {
      this._bridgeTokensPairs.next(bridgeTokensPairs);
    });

    const commonForm = this.swapFormService.commonTrade.controls.input;
    if (commonForm.value.fromBlockchain === commonForm.value.toBlockchain) {
      this._swapProvider = this.instantTradesSwapProvider;
    } else {
      this._swapProvider = this.bridgesSwapProvider;
    }
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(form => {
      if (form.fromBlockchain === form.toBlockchain) {
        this._swapProvider = this.instantTradesSwapProvider;
      } else {
        this._swapProvider = this.bridgesSwapProvider;
      }
    });
  }

  public async calculateTrade(): Promise<void> {
    await this.instantTradeService.calculateTrades();
  }

  public createTrade(): void {}
}
