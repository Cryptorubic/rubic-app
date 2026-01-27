import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RailgunService } from '@features/privacy/services/railgun/railgun.service';

@Component({
  selector: 'app-privacy-main-page',
  templateUrl: './privacy-main-page.component.html',
  styleUrls: ['./privacy-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyMainPageComponent {
  constructor(private readonly railgunService: RailgunService) {
    this.initializeRailgun();
  }

  private async initializeRailgun(): Promise<void> {
    await this.railgunService.initServices();
  }
}
