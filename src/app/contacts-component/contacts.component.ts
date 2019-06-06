import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

export interface IForm {
  email: string;
  message: string;
}

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  public contactForm: FormGroup;

  constructor() { }

  public ngOnInit(): void {
    this.contactForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', [Validators.required])
    });
  }

  public onSubmit(): void {
    console.log(this.contactForm.value);
  }

}
