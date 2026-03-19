import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-target-network-address',
  templateUrl: './target-network-address.component.html',
  styleUrls: ['./target-network-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('moveLabel', [
      state('true', style({ color: '#02b774', fontSize: '12px', top: '-5px' })),
      state('false', style({ color: '#9a9ab0', fontSize: '16px', top: '0px' })),
      transition(`true <=> false`, animate('0.2s ease-out'))
    ])
  ]
})
export class TargetNetworkAddressComponent {
  @Input({ required: true }) addressCtrl: FormControl<string>;

  @Input() placeholderText: string = 'You must have access to this address';

  public isActiveInput: boolean = false;

  public readonly isIntegratorWidget =
    this.queryParamsService.hideBranding && this.queryParamsService.useLargeIframe;

  constructor(private readonly queryParamsService: QueryParamsService) {}

  public onFocusChange(isFocused: boolean): void {
    this.isActiveInput = isFocused || !!this.addressCtrl.value;
  }

  public clear(): void {
    this.addressCtrl.reset();
  }
}
