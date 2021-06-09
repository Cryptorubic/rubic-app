import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import InstantTrade from 'src/app/features/swaps-page-old/instant-trades/models/InstantTrade';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';

@Component({
  selector: 'app-new-ui',
  templateUrl: './new-ui.component.html',
  styleUrls: ['./new-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewUiComponent {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  readonly avatarUrl = './assets/images/rubic-logo-main.svg';

  public providerControllers: ProviderControllerData[];

  public instantTrade: InstantTrade;

  public instantTradeTokens: BlockchainToken[];

  public defaultITToken: BlockchainToken;

  public defaultProvider: any;

  public options = ['first', 'second', 'third'];

  constructor() {}

  onClick(event: MouseEvent) {
    console.log('click', event);
  }

  onOptionChange(optionIndex: number): void {
    console.log('chosen option: ', this.options[optionIndex]);
  }
}
