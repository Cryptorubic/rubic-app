import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TokensSelectService } from '../../tokens-select/services/tokens-select.service';

@Component({
  selector: 'app-new-ui',
  templateUrl: './new-ui.component.html',
  styleUrls: ['./new-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewUiComponent {
  readonly avatarUrl = './assets/images/rubic-logo-main.svg';

  constructor(private tokensSelectService: TokensSelectService) {}

  onClick(event: MouseEvent) {
    console.log('click', event);
  }

  openTokensSelect() {
    this.tokensSelectService.showDialog().subscribe(token => alert(`${token.symbol} selected`));
  }
}
