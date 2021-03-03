import { Component, Input } from '@angular/core';
import { UserService } from '../../../services/user/user.service';

const REQUEST_TIME_LENGTH = 60;

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.scss']
})
export class EmailConfirmComponent {
  @Input() currentEmail: string;

  public resendError: number | false;

  public emailConfirmProgress: boolean;

  public allTimerSeconds: number;

  public timerMinutes: number | string;

  public timerSeconds: number | string;

  private startTimerTime;

  constructor(private userService: UserService) {}

  private checkTimer() {
    this.allTimerSeconds =
      REQUEST_TIME_LENGTH - Math.round((new Date().getTime() - this.startTimerTime) / 1000);
    this.timerSeconds = this.allTimerSeconds % 60;
    this.timerMinutes = Math.floor(this.allTimerSeconds / 60);
    this.timerSeconds = (this.timerSeconds < 10 ? '0' : '') + this.timerSeconds;
    this.timerMinutes = (this.timerMinutes < 10 ? '0' : '') + this.timerMinutes;

    if (this.allTimerSeconds <= 0) {
      this.emailConfirmProgress = false;
      // $cookies.put('latest-email-request');
    } else {
      setTimeout(() => {
        this.checkTimer();
      }, 300);
    }
  }

  public getConfirmEmail() {
    if (this.emailConfirmProgress) {
      return;
    }
    this.startTimerTime = new Date().getTime();
    this.resendError = false;

    this.userService.resendConfirmEmail(this.currentEmail).then(
      () => {
        this.checkTimer();
        this.emailConfirmProgress = true;
      },
      error => {
        this.emailConfirmProgress = false;
        switch (error.status) {
          case 403:
            this.resendError = error.data.detail;
            break;
          default:
            break;
        }
      }
    );
  }
}
