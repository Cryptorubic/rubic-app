import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../services/http/http.service';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-index-ico-form',
  templateUrl: './index-ico-form.component.html',
  styleUrls: ['./index-ico-form.component.scss']
})
export class IndexIcoFormComponent implements OnInit {

  public request: any;
  constructor(
    private httpService: HttpService,
    private router: Router,
    private dialogRef: MatDialogRef<IndexIcoFormComponent>,
  ) {
    this.request = {};
  }

  public sendInviteForm() {
    this.httpService.post('/save_swaps_mail/', this.request).toPromise().then((response) => {
      this.router.navigate(['/create-v2/']);
      this.dialogRef.close();
    });
  }

  ngOnInit() {
  }

}
