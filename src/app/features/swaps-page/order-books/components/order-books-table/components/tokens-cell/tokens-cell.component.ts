import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-tokens-cell',
  templateUrl: './tokens-cell.component.html',
  styleUrls: ['./tokens-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensCellComponent {
  @Input() element: any;

  constructor() {}

  public getChainIcon(/* name: string */) {
    // Uncomment after merge with rubic-181_(refactoring)
    // return return BlockchainsInfo.getBlockchainByName(chainName).imagePath;
    return './assets/images/icons/coins/eth.png';
  }
}
