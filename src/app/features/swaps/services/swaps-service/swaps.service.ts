import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IToken } from 'src/app/shared/models/tokens/IToken';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { SwapProvider } from '../swap-provider';
import { BridgesSwapProviderService } from '../../../bridge/services/bridges-swap-provider-service/bridges-swap-provider.service';
import { InstantTradesSwapProviderService } from '../../../instant-trade/services/instant-trades-swap-provider-service/instant-trades-swap-provider.service';
import { SWAP_PROVIDER_TYPE } from '../../models/SwapProviderType';

@Injectable()
export class SwapsService {
  private _swapProvider: SwapProvider;

  private _availableTokens = new BehaviorSubject<IToken[]>([]);

  get availableTokens(): Observable<IToken[]> {
    return this._availableTokens.asObservable();
  }

  get swapMode(): SWAP_PROVIDER_TYPE | null {
    // return this._swapProvider?.TYPE || SWAP_PROVIDER_TYPE.BRIDGE;
    return SWAP_PROVIDER_TYPE.BRIDGE;
  }

  constructor(
    private readonly bridgesSwapProvider: BridgesSwapProviderService,
    private readonly instantTradesSwapProvider: InstantTradesSwapProviderService,
    private readonly swapFormService: SwapFormService
  ) {
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

  public calculateTrade(): void {}

  public createTrade(): void {}
}
