import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RefundService } from '../../services/refund-service/refund.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-refund-address',
  templateUrl: './refund-address.component.html',
  styleUrls: ['./refund-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('moveLabel', [
      state('true', style({ color: '#02b774', fontSize: '12px', top: '-5px' })),
      state('false', style({ color: '#9a9ab0', fontSize: '16px', top: '0px' })),
      transition(`true <=> false`, animate('0.2s ease-out'))
    ])
  ]
})
export class RefundAddressComponent {
  public readonly refundAddressCtrl = this.refundService.refundAddressCtrl;

  public isActiveInput: boolean = false;

  constructor(private readonly refundService: RefundService) {}

  public onFocusChange(isFocused: boolean): void {
    this.isActiveInput = isFocused || !!this.refundAddressCtrl.value;
  }
}
