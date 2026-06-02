import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-wallets-list',
  templateUrl: './wallets-list.component.html',
  styleUrls: ['./wallets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletsListComponent {}
