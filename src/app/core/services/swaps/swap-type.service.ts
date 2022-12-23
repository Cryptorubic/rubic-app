import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';

@Injectable()
export class SwapTypeService {
  private readonly _swapMode$ = new BehaviorSubject<SWAP_PROVIDER_TYPE>(undefined);

  public readonly swapMode$ = this._swapMode$.asObservable();

  public get swapMode(): SWAP_PROVIDER_TYPE | null {
    return this._swapMode$.getValue();
  }

  private set swapMode(swapType: SWAP_PROVIDER_TYPE) {
    this._swapMode$.next(swapType);
  }

  constructor(private readonly swapFormService: SwapFormService) {
    this.subscribeOnForm();
  }

  private subscribeOnForm(): void {
    this.swapFormService.inputValue$.subscribe(() => {
      this.swapMode = this.getSwapProviderType();
    });
  }

  public getSwapProviderType(): SWAP_PROVIDER_TYPE {
    const { fromAssetType, toBlockchain } = this.swapFormService.inputValue;

    if (fromAssetType === 'fiat') {
      return SWAP_PROVIDER_TYPE.ONRAMPER;
    } else if (!fromAssetType || !toBlockchain || fromAssetType === toBlockchain) {
      return SWAP_PROVIDER_TYPE.INSTANT_TRADE;
    } else {
      return SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
    }
  }
}
