import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoComponent {
  @Input({ required: true }) isDarkTheme: boolean;

  @Input({ required: true }) noFrameLink: string;

  @Input({ required: true }) currentUser: boolean;

  private readonly gtmService = inject(GoogleTagManagerService);

  public navigateToHome(): void {
    this.gtmService.fireSwitchModeEvent('regular');
  }
}
