import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpService } from '../services/http/http.service';

export interface IForm {
  email: string;
  message: string;
}

export const FEEDBACK_URL = 'send_unblocking_feedback/';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  public contactForm: FormGroup;
  public isSuccess: boolean;

  constructor(private http: HttpService) {}

  public ngOnInit(): void {
    this.contactForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', [Validators.required])
    });
  }

  public onSubmit(): void {
    this.http.post(FEEDBACK_URL, this.contactForm.value).subscribe(() => (this.isSuccess = true));
  }
}
