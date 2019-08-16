import {Component, OnInit, ViewChild} from '@angular/core';

import { TEAM_SOURCE } from './team-resource';

import {IndexIcoFormComponent} from './index-ico-form/index-ico-form.component';
import {MatDialog} from '@angular/material';
import {HttpClient} from '@angular/common/http';

import {OwlCarousel} from 'ngx-owl-carousel';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';


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

  @ViewChild('bqSlider') bqSlider: OwlCarousel;

  public teamSource;
  public msgCount: number;
  private serverDateTime: number;
  private currentDateTime: number;
  public leftSeconds: number;
  private leftTime: number;
  public timerDigits: ITimer;
  public visibleTeam: boolean;

  private startTimerTime: any;

  public countBqSlides: number;

  public timerArcDeg: number;

  private translator: TranslateService;

  public selectedLanguage: string;

  public lngLinks: any;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    translate: TranslateService
  ) {

    this.lngLinks = {
      ru: 'ru',
      en: 'en',
      zh: 'cn',
      ko: 'kr'
    };

    this.translator = translate;

    this.selectedLanguage = translate.currentLang;

    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.selectedLanguage = event.lang;
    });

    this.teamSource = TEAM_SOURCE.map((person: any) => {
      person.avatarPath = './assets/images/team/' + person.avatarPath;
      return person;
    });

    this.msgCount = 1;

    this.startTimerTime = Date.UTC(2019, 7, 6, 9, 0, 0);

    this.leftTime = Date.UTC(2019, 7, 21, 9, 30, 0);

    this.currentDateTime = new Date().getTime();


    // this.leftTime = this.currentDateTime + 5000;


    this.http.get('/assets/images/1x1.png?_t=' + (new Date()).getTime(), {
      responseType: 'text', observe: 'response'
    })
      .subscribe(res => {
        this.serverDateTime = new Date(res.headers.get('Date')).getTime();

        setInterval(() => {
          this.checkLeftTIme();
        }, 200);
      });

  }


  private telegramTimerStart() {
    setTimeout(() => {
      this.msgCount++;
      this.telegramTimerStart();
    }, 5000 * ((this.msgCount + 1)) * 2);
  }

  ngOnInit() {
    this.telegramTimerStart();
    this.countBqSlides = this.bqSlider.$owlChild['el'].nativeElement.childElementCount;
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

    this.timerArcDeg =  -180 + 360 * (this.leftSeconds * 1000 / (this.leftTime - this.startTimerTime));

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


  public openFullInviteForm() {
    this.dialog.open(IndexIcoFormComponent, {
      width: '420px',
      panelClass: 'custom-dialog-container',
      data: {
        fullForm: true
      }
    });
  }

  public showAllTeam() {
    return;
    this.visibleTeam = true;
  }

}
