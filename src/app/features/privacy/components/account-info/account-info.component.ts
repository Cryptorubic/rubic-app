import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountInfoComponent {
  @Input({ required: true }) accountId: string;

  @Input({ required: true }) railgunAddress: string;

  @Output() handleLogout = new EventEmitter<void>();

  public logout(): void {
    this.handleLogout.emit();
  }
}
