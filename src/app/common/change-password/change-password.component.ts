import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../auth/registration/registration.component';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  public changePassForm: FormGroup;
  public ServerErrors;
  public formIsSubmitted: boolean;
  public formIsProgress: boolean;

  private requestData: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<ChangePasswordComponent>
  ) {
    this.ServerErrors = {};
    this.requestData = this.data.params;
  }
  ngOnInit() {
    this.changePassForm = this.formBuilder.group(
      {
        new_password1: ['', Validators.compose([Validators.required])],
        new_password2: ['', Validators.compose([Validators.required])]
      },
      {
        validator: MustMatch('new_password1', 'new_password2')
      }
    );
  }

  public sendChangePassForm() {
    console.log(this.changePassForm);
    if (this.changePassForm.invalid) {
      this.formIsSubmitted = true;
      return;
    }
    this.formIsProgress = true;

    const requestData = { ...this.requestData, ...this.changePassForm.value };

    this.userService
      .passwordChange(requestData)
      .then(
        response => {
          this.dialogRef.close();
        },
        error => {
          switch (error.status) {
            case 400:
              this.ServerErrors = error.error;
              break;
          }
        }
      )
      .finally(() => {
        this.formIsProgress = false;
      });
  }
}
