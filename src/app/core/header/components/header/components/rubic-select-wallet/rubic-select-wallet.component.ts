import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';

@Component({
  selector: 'app-rubic-select-wallet',
  templateUrl: './rubic-select-wallet.component.html',
  styleUrls: ['./rubic-select-wallet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicSelectWalletComponent {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<unknown>>;

  public selectedWallet = '0x0000000000000000000000000000000000000';

  public dropdownIsOpened = false;

  public wallets = [
    '0x0000000000000000000000000000000000000',
    '0x1111111111111111111111111111111111111'
  ];

  constructor() {}

  public getDropdownStatus(status: boolean) {
    this.dropdownIsOpened = status;
  }
}
