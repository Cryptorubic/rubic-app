import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../services/user/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  public ServerErrors: {
    username?: [any];
    email?: [any];
    non_field_errors?: [any];
  } = {};
  public SuccessText: string|undefined;
  public forgotForm: FormGroup;
  public formIsProgress: boolean;

  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService
  ) { }

  public resetForgotForm() {
    this.SuccessText = undefined;
    this.ServerErrors = {};
  }

  public sendResetPassForm() {
    if (this.forgotForm.invalid) {
      return;
    }
    this.formIsProgress = true;
    this._userService.passwordReset(this.forgotForm.value.email).then((response) => {
      this.SuccessText = response.detail;
    }, (error) => {
      switch (error.status) {
        case 400:
          this.ServerErrors = error.data;
          break;
      }
    }).finally(() => {
      this.formIsProgress = false;
    });
  }

  ngOnInit() {
    this.forgotForm = this._formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])]
    }, {});
  }

}
