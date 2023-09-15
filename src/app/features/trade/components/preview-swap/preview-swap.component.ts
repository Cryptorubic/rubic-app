import { ChangeDetectionStrategy, Component } from '@angular/core';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-preview-swap',
  templateUrl: './preview-swap.component.html',
  styleUrls: ['./preview-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewSwapComponent {
  public gasFee = new BigNumber(3.44159);

  public providerFee = new BigNumber(3.44159);

  public time = '3 min';
}
