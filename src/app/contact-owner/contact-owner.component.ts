import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {HttpService} from '../services/http/http.service';

@Component({
  selector: 'app-contact-owner',
  templateUrl: './contact-owner.component.html',
  styleUrls: ['./contact-owner.component.scss']
})

export class ContactOwnerComponent implements OnInit, OnDestroy {

  public formData;
  public formSuccess: boolean;
  public formIsSending: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public contractInfo,
    private dialogRef: MatDialogRef<ContactOwnerComponent>,
    private httpService: HttpService
  ) {

    this.formData = {
      link: this.contractInfo.unique_link_url || this.contractInfo.contract_details.unique_link_url,
      contract_id: this.contractInfo.id
    };
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public sendForm() {
    this.formIsSending = true;
    this.httpService.post('send_message_author_swap/', this.formData).toPromise().then((result) => {
      // this.dialogRef.close();
      this.formIsSending = false;
      this.formSuccess = true;
    });
  }


}
