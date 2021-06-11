import { Component, Input, QueryList, TemplateRef, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-rubic-blockchains',
  templateUrl: './rubic-blockchains.component.html',
  styleUrls: ['./rubic-blockchains.component.scss']
})
export class RubicBlockchainsComponent {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  public selectedBlockchain = 'Ethereum';

  @Input() blockchainsList: Array<any>;

  constructor() {}

  onOptionChange($event) {
    console.log($event);
  }
}
