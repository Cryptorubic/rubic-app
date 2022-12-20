import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { SwapFormInput } from 'src/app/core/services/swaps/models/swap-form-controls';

@Injectable()
export class SwapTypeService {
  private readonly _swapMode$ = new BehaviorSubject<SWAP_PROVIDER_TYPE>(undefined);

  public readonly swapMode$ = this._swapMode$.asObservable();

  get swapMode(): SWAP_PROVIDER_TYPE | null {
    return this._swapMode$.getValue();
  }

  set swapMode(swapType: SWAP_PROVIDER_TYPE) {
    this._swapMode$.next(swapType);
  }

  constructor(private readonly swapFormService: SwapFormService) {
    this.subscribeOnForm();
  }

  private subscribeOnForm(): void {
    this.swapFormService.inputValue$.subscribe(form => {
      this.setSwapProviderType(form);
    });
  }

  private setSwapProviderType(form: SwapFormInput): void {
    const { fromAssetType, toBlockchain } = form;

    if (fromAssetType === 'fiat') {
      this.swapMode = SWAP_PROVIDER_TYPE.ONRAMPER;
    } else if (!fromAssetType || !toBlockchain || fromAssetType === toBlockchain) {
      this.swapMode = SWAP_PROVIDER_TYPE.INSTANT_TRADE;
    } else {
      this.swapMode = SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
    }
  }
}
