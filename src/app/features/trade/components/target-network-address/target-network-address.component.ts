import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-target-network-address',
  templateUrl: './target-network-address.component.html',
  styleUrls: ['./target-network-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [
    trigger('moveLabel', [
      state('true', style({ color: '#02b774', fontSize: '12px', top: '-5px' })),
      state('false', style({ color: '#9a9ab0', fontSize: '16px', top: '0px' })),
      transition(`true <=> false`, animate('0.2s ease-out'))
    ])
  ]
})
export class TargetNetworkAddressComponent {
  public readonly address = this.targetNetworkAddressService.addressControl;

  public toBlockchain$ = this.swapFormService.toBlockchain$;

  public isActiveInput: boolean = false;

  constructor(
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly swapFormService: SwapsFormService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public onFocusChange(isFocused: boolean): void {
    this.isActiveInput = isFocused || !!this.address.value;
  }
}
