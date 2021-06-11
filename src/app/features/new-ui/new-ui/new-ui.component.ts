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
