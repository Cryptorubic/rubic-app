import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../services/http/http.service';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-index-ico-form',
  templateUrl: './index-ico-form.component.html',
  styleUrls: ['./index-ico-form.component.scss']
})
export class IndexIcoFormComponent implements OnInit {

  public request: any;
  public formSuccess: boolean;

  constructor(
    private httpService: HttpService,
    private router: Router,
    private dialogRef: MatDialogRef<IndexIcoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.request = {};
  }

  public sendInviteForm() {

    window['ym'](54361084, 'reachGoal', 'lead');

    this.httpService.post('/save_swaps_mail/', this.request).toPromise().then((response) => {
      if (!this.data.fullForm) {
        this.router.navigate(['/create-v2/']);
        this.dialogRef.close();
      } else {
        this.formSuccess = true;
        location.href = 'https://www.bitforex.com/ru/spot/swap_usdt';
        // this.dialogRef.close();
      }
    });
  }

  ngOnInit() {
  }

}
