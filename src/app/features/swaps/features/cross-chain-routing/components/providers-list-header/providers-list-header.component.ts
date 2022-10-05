import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: ' app-providers-list-header',
  templateUrl: './providers-list-header.component.html',
  styleUrls: ['./providers-list-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersListHeaderComponent {
  @Output() public readonly closeHandler = new EventEmitter<void>();

  @Input() public readonly calculatedProviders: number;

  constructor() {}

  public handleClose(): void {
    this.closeHandler.emit();
  }
}
