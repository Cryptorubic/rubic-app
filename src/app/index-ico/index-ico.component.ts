import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http/http.service';
import { TEAM_SOURCE } from './team-resource';
import {DomSanitizer} from '@angular/platform-browser';

const STAT_URL = 'get_statistics_landing/';


@Component({
  selector: 'app-index-ico',
  templateUrl: './index-ico.component.html',
  styleUrls: ['./index-ico.component.scss']
})
export class IndexIcoComponent implements OnInit {

  public teamSource;

  constructor() {

    this.teamSource = TEAM_SOURCE.map((person: any) => {
      person.avatarPath = './assets/images/team/' + person.avatarPath;
      return person;
    });
  }

  ngOnInit() {}

}
