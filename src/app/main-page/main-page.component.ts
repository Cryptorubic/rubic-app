import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { ChangePasswordComponent } from '../common/change-password/change-password.component';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  constructor(private router: Router, private dialog: MatDialog, protected route: ActivatedRoute) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (route.snapshot.params.uid && route.snapshot.params.token) {
          this.dialog.open(ChangePasswordComponent, {
            width: '480px',
            panelClass: 'custom-dialog-container',
            data: {
              params: route.snapshot.params
            }
          });
        }
        if (event.url === '/dashboard/first_entry' && window['dataLayer']) {
          window['dataLayer'].push({ event: 'sign-up' });
        }
      }
    });
  }

  ngOnInit() {
    // eslint-disable-next-line no-new
    new window['ScrollTopButton'](500);
  }
}
