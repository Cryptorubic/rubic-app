import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

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
}
