import { ChangeDetectionStrategy, Component, Inject, OnInit, Self } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, skip, takeUntil, tap } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { WINDOW } from '@ng-web-apis/common';
import { FormControl } from '@angular/forms';
import { compareTokens, isNil } from '@app/shared/utils/utils';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { getCorrectAddressValidator } from '@features/trade/components/target-network-address/utils/get-correct-address-validator';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AnimationState, animationState } from './consts/animation-state';

@Component({
  selector: 'app-target-network-address',
  templateUrl: './target-network-address.component.html',
  styleUrls: ['./target-network-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [
    trigger('moveLabel', [
      state(animationState.focus, style({ color: '#02b774', fontSize: '12px', top: '-5px' })),
      state(animationState.leave, style({ color: '#9a9ab0', fontSize: '16px', top: '0px' })),
      transition(`${animationState.focus} => ${animationState.leave}`, [animate('0.2s ease-out')]),
      transition(`${animationState.leave} => ${animationState.focus}`, [animate('0.2s ease-in')])
    ])
  ]
})
export class TargetNetworkAddressComponent implements OnInit {
  public readonly address = new FormControl<string>(this.targetNetworkAddressService.address);

  public toBlockchain$ = this.swapFormService.toBlockchain$;

  public animationState: AnimationState = animationState.leave;

  constructor(
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly swapFormService: SwapsFormService,
    @Inject(WINDOW) private readonly window: Window,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.subscribeOnTargetAddress();
    this.subscribeOnFormValues();
    const input = this.swapFormService.inputValue;
    this.address.setAsyncValidators(
      getCorrectAddressValidator({
        fromAssetType: input.fromBlockchain,
        toBlockchain: input.toBlockchain
      })
    );
  }

  public onInputClick(isFocused: boolean): void {
    if (this.address.value || isFocused) {
      this.animationState = animationState.focus;
    } else {
      this.animationState = animationState.leave;
    }
  }

  private subscribeOnFormValues(): void {
    this.swapFormService.inputValue$
      .pipe(
        skip(1),
        tap(inputForm => {
          this.address.setAsyncValidators(
            getCorrectAddressValidator({
              fromAssetType: inputForm.fromBlockchain,
              toBlockchain: inputForm.toBlockchain
            })
          );
        }),
        filter(form => !isNil(form.fromBlockchain) && !isNil(form.toToken)),
        distinctUntilChanged((prev, curr) => {
          return (
            compareTokens(prev.fromToken, curr.toToken) && compareTokens(prev.toToken, curr.toToken)
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
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(address => {
        const isValid = this.address.valid;
        this.targetNetworkAddressService.setIsAddressValid(isValid);
        this.targetNetworkAddressService.setAddress(isValid ? address : null);
      });
  }
}
