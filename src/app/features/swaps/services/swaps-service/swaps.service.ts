import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IToken } from 'src/app/shared/models/tokens/IToken';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { InstantTradeService } from 'src/app/features/instant-trade/services/instant-trade-service/instant-trade.service';
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
    return this._swapProvider?.TYPE;
  }

  constructor(
    private readonly bridgesSwapProvider: BridgesSwapProviderService,
    private readonly instantTradesSwapProvider: InstantTradesSwapProviderService,
    private readonly swapFormService: SwapFormService,
    private readonly instantTradeService: InstantTradeService
  ) {
    const commonForm = this.swapFormService.commonTrade;
    if (commonForm.get('fromBlockchain').value === commonForm.get('toBlockchain').value) {
      this._swapProvider = this.instantTradesSwapProvider;
    } else {
      this._swapProvider = this.bridgesSwapProvider;
    }
    this.swapFormService.commonTrade.valueChanges.subscribe(form => {
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
