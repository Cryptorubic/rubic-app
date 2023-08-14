import { Injectable } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';

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

  constructor(private readonly swapFormService: SwapFormService, private readonly router: Router) {
    this.subscribeOnForm();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged((prev: NavigationEnd, cur: NavigationEnd) => prev?.url === cur?.url)
      )
      .subscribe(() => {
        this.swapMode = this.getSwapProviderType();
      });
  }

  private subscribeOnForm(): void {
    this.swapFormService.inputValue$.subscribe(() => {
      this.swapMode = this.getSwapProviderType();
    });
  }

  public getSwapProviderType(): SWAP_PROVIDER_TYPE {
    if (this.router.url.includes('limit-order')) {
      return SWAP_PROVIDER_TYPE.LIMIT_ORDER;
    }

    const { fromAssetType, toBlockchain } = this.swapFormService.inputValue;

    if (fromAssetType === 'fiat') {
      return SWAP_PROVIDER_TYPE.ONRAMPER;
    } else if (!fromAssetType || !toBlockchain || fromAssetType === toBlockchain) {
      return SWAP_PROVIDER_TYPE.INSTANT_TRADE;
    } else {
      return SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
    }
  }

  public async navigateToSwaps(): Promise<void> {
    this.swapFormService.outputControl.patchValue({
      toAmount: null
    });
    await this.router.navigate(['/'], { queryParamsHandling: 'merge' });
  }

  public async navigateToFaucets(): Promise<void> {
    this.swapFormService.outputControl.patchValue({
      toAmount: null
    });
    await this.router.navigate(['faucets'], { queryParamsHandling: 'merge' });
  }

  public async navigateToLimitOrder(): Promise<void> {
    this.swapFormService.outputControl.patchValue({
      toAmount: null
    });
    const { fromAssetType, toBlockchain, fromAsset, toToken } = this.swapFormService.inputValue;
    if (fromAssetType !== toBlockchain) {
      if (fromAssetType !== 'fiat' && (fromAsset || !toToken)) {
        this.swapFormService.inputControl.patchValue({
          toBlockchain: fromAssetType,
          toToken: null
        });
      } else {
        this.swapFormService.inputControl.patchValue({
          fromAssetType: toBlockchain,
          fromAsset: null
        });
      }
    }
    await this.router.navigate(['/limit-order'], { queryParamsHandling: 'merge' });
  }
}
