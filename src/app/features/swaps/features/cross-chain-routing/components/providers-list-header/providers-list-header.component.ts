import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'polymorpheus-providers-list-header',
  templateUrl: './providers-list-header.component.html',
  styleUrls: ['./providers-list-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersListHeaderComponent {
  constructor() {}
}
