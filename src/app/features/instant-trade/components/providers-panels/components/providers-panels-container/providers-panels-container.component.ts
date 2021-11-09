import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { ProviderControllerData } from '@shared/models/instant-trade/providers-controller-data';

@Component({
  selector: 'app-providers-panels-container',
  templateUrl: './providers-panels-container.component.html',
  styleUrls: ['./providers-panels-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersPanelsContainerComponent {
  @Input() public providers: ProviderControllerData[];

  @Output() public onSelectProvider = new EventEmitter<ProviderControllerData>();

  public allProvidersShown: boolean;

  constructor() {
    this.allProvidersShown = false;
  }
}
