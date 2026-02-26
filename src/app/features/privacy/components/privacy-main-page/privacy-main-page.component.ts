import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-railgun-main-page',
  templateUrl: './privacy-main-page.component.html',
  styleUrls: ['./privacy-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyMainPageComponent {
  public readonly cards = [
    {
      title: 'Railgun',
      description: 'Privacy wallet for EVM blockchains',
      link: './railgun'
    }
  ];
}
