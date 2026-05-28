import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-user-profile-wallets',
  templateUrl: './user-profile-wallets.component.html',
  styleUrls: ['./user-profile-wallets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileWalletsComponent {
  public currentIdx: number = 0;
}
