import { ChangeDetectionStrategy, Component, Inject, OnInit, Self } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, skip, takeUntil, tap } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { WINDOW } from '@ng-web-apis/common';
import { FormControl } from '@angular/forms';
import { compareTokens, isNil } from '@app/shared/utils/utils';
import { getCorrectAddressValidator } from '@features/swaps/shared/components/target-network-address/utils/get-correct-address-validator';
import { compareAssets } from '@features/swaps/shared/utils/compare-assets';
import { combineLatestWith } from 'rxjs';

@Component({
  selector: 'app-target-network-address',
  templateUrl: './target-network-address.component.html',
  styleUrls: ['./target-network-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TargetNetworkAddressComponent implements OnInit {
  public readonly address = new FormControl<string>(this.targetNetworkAddressService.address);

  public toBlockchain$ = this.swapFormService.toBlockchain$;

  constructor(
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly swapFormService: SwapFormService,
    @Inject(WINDOW) private readonly window: Window,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.subscribeOnTargetAddress();
    this.subscribeOnFormValues();
  }

  private subscribeOnFormValues(): void {
    this.swapFormService.inputValue$
      .pipe(
        skip(1),
        tap(inputForm => {
          this.address.setAsyncValidators(getCorrectAddressValidator(inputForm));
        }),
        filter(form => !isNil(form.fromAsset) && !isNil(form.toToken)),
        distinctUntilChanged((prev, curr) => {
          return (
            compareAssets(prev.fromAsset, curr.fromAsset) &&
            compareTokens(prev.toToken, curr.toToken)
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.address.patchValue(null);
      });
  }

  private subscribeOnTargetAddress(): void {
    this.address.valueChanges
      .pipe(
        combineLatestWith(this.address.statusChanges),
        debounceTime(10),
        takeUntil(this.destroy$)
      )
      .subscribe(([address, status]) => {
        this.targetNetworkAddressService.setIsAddressValid(status === 'VALID');
        this.targetNetworkAddressService.setAddress(status === 'VALID' ? address : null);
      });
  }
}
