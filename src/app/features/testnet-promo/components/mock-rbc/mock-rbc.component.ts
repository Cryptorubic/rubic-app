import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-mock-rbc',
  templateUrl: './mock-rbc.component.html',
  styleUrls: ['./mock-rbc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MockRbcComponent {
  constructor(private readonly googleTagManagerService: GoogleTagManagerService) {}

  public onVerifyLinkClick(): void {
    this.googleTagManagerService.fireClickOnVerifyEvent();
  }
}
