import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';

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

  constructor() {}

  onClick(event: MouseEvent) {
    console.log('click', event);
  }

  onOptionChange(optionIndex: number): void {
    console.log('chosen option: ', this.options[optionIndex]);
  }
}
