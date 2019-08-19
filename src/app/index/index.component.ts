import { Component, OnInit } from '@angular/core';
import PROJECTS from './projects-resourses';
import { HttpService } from '../services/http/http.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {ChangePasswordComponent} from '../common/change-password/change-password.component';

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
    private router: Router,
    private dialog: MatDialog,
    route: ActivatedRoute
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.dialog.open(ChangePasswordComponent, {
          width: '480px',
          panelClass: 'custom-dialog-container',
          data: {
            params: route.snapshot.params
          }
        });

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
