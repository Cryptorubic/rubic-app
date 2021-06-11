import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { NewUiDataService } from 'src/app/features/new-ui/new-ui-data.service';
import { TokensSelectService } from '../../tokens-select/services/tokens-select.service';

@Component({
  selector: 'app-new-ui',
  templateUrl: './new-ui.component.html',
  styleUrls: ['./new-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewUiComponent {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  readonly avatarUrl = './assets/images/rubic-logo-main.svg';

  public blockchainsList = [
    { name: 'Binance Smart Chain', chainImg: 'assets/images/icons/coins/bnb.svg' },
    { name: 'Polygon', chainImg: 'assets/images/icons/coins/polygon.svg' },
    { name: 'Ethereum', chainImg: 'assets/images/icons/eth-logo.svg' },
    { name: 'xDai', chainImg: 'assets/images/icons/coins/xdai.svg' },
    { name: 'Kovan', chainImg: 'assets/images/icons/coins/kovan.png' }
  ];

  public options = ['first', 'second', 'third'];

  constructor(
    public readonly store: NewUiDataService,
    private tokensSelectService: TokensSelectService
  ) {}

  onClick(event: MouseEvent) {
    console.log('click', event);
  }

  openTokensSelect() {
    this.tokensSelectService
      .showDialog()
      .subscribe(token =>
        alert(`Token ${token.symbol} in ${token.blockchain} blockchain selected`)
      );
  }

  onOptionChange(optionIndex: number): void {
    console.log('chosen option: ', this.options[optionIndex]);
  }
}
