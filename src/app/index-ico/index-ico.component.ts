import { Component, OnInit } from '@angular/core';

import { TEAM_SOURCE } from './team-resource';

import {IndexIcoFormComponent} from './index-ico-form/index-ico-form.component';
import {MatDialog} from '@angular/material';
import {HttpClient} from '@angular/common/http';


const STAT_URL = 'get_statistics_landing/';


export interface ITimer {
  days: number;
  hours: number | string;
  minutes: number | string;
  seconds: number | string;
}


@Component({
  selector: 'app-index-ico',
  templateUrl: './index-ico.component.html',
  styleUrls: ['./index-ico.component.scss']
})


export class IndexIcoComponent implements OnInit {

  public teamSource;
  public msgCount: number;
  private serverDateTime: number;
  private currentDateTime: number;
  private leftSeconds: number;
  private leftTime: number;
  public timerDigits: ITimer;


  constructor(
    private dialog: MatDialog,
    private http: HttpClient
  ) {


    this.teamSource = TEAM_SOURCE.map((person: any) => {
      person.avatarPath = './assets/images/team/' + person.avatarPath;
      return person;
    });

    this.msgCount = 1;

    this.http.get('/assets/images/1x1.png?_t=' + (new Date()).getTime(), {
      responseType: 'text', observe: 'response'
    })
      .subscribe(res => {
        this.serverDateTime = new Date(res.headers.get('Date')).getTime();
        this.currentDateTime = new Date().getTime();
        // 12/03/19 3:00PM GMT
        this.leftTime = Date.UTC(2019, 6, 15, 9, 0, 0);

        setInterval(() => {
          this.checkLeftTIme();
        }, 200);
      });

  }

  ngOnInit() {
    setInterval(() => {
      this.msgCount++;
    }, 5000);
  }

  public checkLeftTIme(): void {
    this.leftSeconds =
      Math.max(0, Math.floor((this.leftTime - this.serverDateTime - (new Date().getTime() - this.currentDateTime)) / 1000));

    this.timerDigits = {
      days: Math.floor(this.leftSeconds / (3600 * 24)),
      hours: Math.floor(this.leftSeconds % (3600 * 24) / 3600),
      minutes: Math.floor(this.leftSeconds % (3600) / 60),
      seconds: this.leftSeconds % 60
    };

    this.timerDigits.hours = (this.timerDigits.hours < 10) ? '0' + this.timerDigits.hours : this.timerDigits.hours;
    this.timerDigits.minutes = (this.timerDigits.minutes < 10) ? '0' + this.timerDigits.minutes : this.timerDigits.minutes;
    this.timerDigits.seconds = (this.timerDigits.seconds < 10) ? '0' + this.timerDigits.seconds : this.timerDigits.seconds;
  }


  public openInviteForm() {
    this.dialog.open(IndexIcoFormComponent, {
      width: '380px',
      panelClass: 'custom-dialog-container',
      data: {}
    });
  }


}
