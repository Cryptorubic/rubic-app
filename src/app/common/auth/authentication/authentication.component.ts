import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user/user.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {
  @Input() public data;

  public loginForm: FormGroup;

  public formIsProgress: boolean;

  public ServerErrors: {
    username?: [string];
    password?: [string];
    totp?: [string];
    non_field_errors?: [string];
  } = {};

  public formIsSubmitted: boolean;

  constructor(private _formBuilder: FormBuilder, private _userService: UserService) {}

  private totpControl = new FormControl();

  ngOnInit() {
    this.loginForm = this._formBuilder.group(
      {
        username: ['', Validators.compose([Validators.required, Validators.email])],
        password: ['', Validators.compose([Validators.required])]
      },
      {}
    );
    this.totpControl.setValidators([Validators.compose([Validators.required])]);
  }

  get f() {
    return this.loginForm.controls;
  }

  public resetUsername() {
    this.ServerErrors = {};
    this.loginForm.removeControl('totp');
  }

  public sendLoginForm() {
    if (this.loginForm.invalid) {
      this.formIsSubmitted = true;
      return;
    }
    this.formIsProgress = true;
    this._userService
      .authenticate(this.loginForm.value)
      .then(
        () => {},
        error => {
          switch (error.status) {
            case 403:
              switch (error.error.detail) {
                case '1019':
                  this.loginForm.addControl('totp', this.totpControl);
                  break;
                case '1020':
                  this.ServerErrors = {
                    totp: ['Invalid code']
                  };
                  break;
                default:
                  break;
              }
              break;
            case 400:
              this.ServerErrors = error.error;
              break;
            default:
              break;
          }
        }
      )
      .finally(() => {
        this.formIsProgress = false;
      });
  }
}
