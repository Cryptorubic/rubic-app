import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { InstantTradeProviderData } from '@features/instant-trade/models/providers-controller-data';

@Component({
  selector: 'app-providers-panels-container',
  templateUrl: './providers-panels-container.component.html',
  styleUrls: ['./providers-panels-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersPanelsContainerComponent {
  @Input() public providers: InstantTradeProviderData[];

  @Output() public onSelectProvider = new EventEmitter<InstantTradeProviderData>();

  public allProvidersShown: boolean;

  constructor() {
    this.allProvidersShown = false;
  }
}
