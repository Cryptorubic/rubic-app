import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-railgun-account-info',
  templateUrl: './railgun-account-info.component.html',
  styleUrls: ['./railgun-account-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RailgunAccountInfoComponent {
  @Input({ required: true }) accountId: string;

  @Input({ required: true }) railgunAddress: string;

  @Output() handleLogout = new EventEmitter<void>();

  public logout(): void {
    this.handleLogout.emit();
  }
}
