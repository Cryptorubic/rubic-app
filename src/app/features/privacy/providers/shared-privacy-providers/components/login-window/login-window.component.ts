import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-login-window',
  templateUrl: './login-window.component.html',
  styleUrls: ['./login-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginWindowComponent {
  @Input({ required: true }) authorized: boolean;

  @Input() isPlatformLoaded: boolean = false;

  @Output() handleClick = new EventEmitter();

  public onClick(): void {
    this.handleClick.emit();
  }
}
