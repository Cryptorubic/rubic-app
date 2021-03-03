import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  public currentEmail = 'kovalyov1987@gmail.com';

  public socialAuthError;

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
    this.onRegister = email => {
      this.currentEmail = email;
      this.data.chapter = 'email-confirm';
    };
  }

  public onRegister;

  changedSocialState(socialAuthError) {
    this.socialAuthError = socialAuthError;
  }
}
