import { Component, OnInit } from '@angular/core';
import PROJECTS from './projects-resourses';
import { HttpService } from '../services/http/http.service';
import {NavigationEnd, Router} from '@angular/router';

const STAT_URL = 'get_statistics_landing/';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  public projects = PROJECTS;
  public stat;
  constructor(
    private httpService: HttpService,
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if ((event.url === '/dashboard/first_entry') && window['dataLayer']) {
          window['dataLayer'].push({'event': 'sign-up'});
        }
      }
    });
    console.log(this.router);
  }

  ngOnInit() {
    // this.httpService.get(STAT_URL).subscribe(res => this.stat = res);
    new window['ScrollTopButton'](500);
  }

}
