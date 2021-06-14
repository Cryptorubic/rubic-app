import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SwapProvider } from '../swap-provider';
import { BridgesSwapProviderService } from '../../../bridge/services/bridges-swap-provider-service/bridges-swap-provider.service';
import { InstantTradesSwapProviderService } from '../../../instant-trade/services/instant-trades-swap-provider-service/instant-trades-swap-provider.service';
import { IToken } from '../../../../shared/models/tokens/IToken';
import { SWAP_PROVIDER_TYPE } from '../../models/SwapProviderType';

@Injectable()
export class SwapsService {
  private _swapProvider: SwapProvider;

  private _availableTokens = new BehaviorSubject<IToken[]>([]);

  get availableTokens(): Observable<IToken[]> {
    return this._availableTokens.asObservable();
  }

  get swapMode(): SWAP_PROVIDER_TYPE | null {
    return this._swapProvider?.TYPE;
  }

  constructor(
    private bridgesSwapProvider: BridgesSwapProviderService,
    private instantTradesSwapProvider: InstantTradesSwapProviderService
  ) {}
}
