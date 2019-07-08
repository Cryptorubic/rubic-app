import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http/http.service';
import { TEAM_SOURCE } from './team-resource';
import {DomSanitizer} from '@angular/platform-browser';
import {IndexIcoFormComponent} from './index-ico-form/index-ico-form.component';
import {MatDialog} from '@angular/material';

const STAT_URL = 'get_statistics_landing/';


@Component({
  selector: 'app-index-ico',
  templateUrl: './index-ico.component.html',
  styleUrls: ['./index-ico.component.scss']
})
export class IndexIcoComponent implements OnInit {

  public teamSource;
  public msgCount: number;

  constructor(
    private dialog: MatDialog
  ) {

    this.teamSource = TEAM_SOURCE.map((person: any) => {
      person.avatarPath = './assets/images/team/' + person.avatarPath;
      return person;
    });

    this.msgCount = 1;

  }

  ngOnInit() {
    setInterval(() => {
      this.msgCount++;
    }, 5000);
  }


  public openInviteForm() {
    this.dialog.open(IndexIcoFormComponent, {
      width: '380px',
      panelClass: 'custom-dialog-container',
      data: {}
    });
  }


}
