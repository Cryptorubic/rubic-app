import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-airdrop-page',
  templateUrl: './airdrop-page.component.html',
  styleUrls: ['./airdrop-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirdropPageComponent {
  constructor() {}
}
