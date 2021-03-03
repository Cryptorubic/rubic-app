import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';

export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      return;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  @Input() registered: any;

  public registrationForm: FormGroup;

  public formIsProgress: boolean;

  public ServerErrors: {
    username?: [string];
    email?: [string];
    password1?: [string];
    password2?: [string];
    non_field_errors?: [string];
  } = {};

  public formIsSubmitted: boolean;

  constructor(private _formBuilder: FormBuilder, private _userService: UserService) {}

  ngOnInit() {
    this.registrationForm = this._formBuilder.group(
      {
        username: ['', Validators.compose([Validators.required, Validators.email])],
        password1: ['', Validators.compose([Validators.required])],
        password2: ['', Validators.compose([Validators.required])]
      },
      {
        validator: MustMatch('password1', 'password2')
      }
    );
  }

  get f() {
    return this.registrationForm.controls;
  }

  public sendRegForm() {
    if (this.registrationForm.invalid) {
      this.formIsSubmitted = true;
      return;
    }
    this.formIsProgress = true;

    this._userService
      .registration(this.registrationForm.value)
      .then(
        () => {
          this.registered(this.registrationForm.value.username);
        },
        error => {
          switch (error.status) {
            case 403:
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
