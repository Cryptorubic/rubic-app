import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { HttpService } from '../services/http/http.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ChangePasswordComponent } from '../common/change-password/change-password.component';
import {DisclaimerComponent} from "../components/disclaimer/disclaimer.component";
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit, AfterViewInit {

  @ViewChild('disclaimerText') disclaimerText;
  public isInstanceTrade: boolean = false;

  @ViewChild('listingModal') listing: TemplateRef<any>;

  protected listingModal: MatDialogRef<any>;

  public selectedBlockchain: string;

  constructor(
    private httpService: HttpService,
    private router: Router,
    private dialog: MatDialog,
    route: ActivatedRoute
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (route.snapshot.params.uid && route.snapshot.params.token) {
          this.dialog.open(ChangePasswordComponent, {
            width: '480px',
            panelClass: 'custom-dialog-container',
            data: {
              params: route.snapshot.params,
            },
          });
        }
        if (event.url === '/dashboard/first_entry' && window['dataLayer']) {
          window['dataLayer'].push({ event: 'sign-up' });
        }
      }
    });
  }

  private openDisclaimer(): void {
    this.dialog.open(DisclaimerComponent, {
      width: '650px',
      disableClose: true,
      data: {
        text: 'DISCLAIMERS.START.TEXT',
        title: 'DISCLAIMERS.START.TITLE',
        actions: {}
      },
    });
  }

  ngAfterViewInit() {
    const link = this.disclaimerText.nativeElement.getElementsByClassName('as-link')[0];
    if (link) {
      link.onclick = (event) => {
        event.preventDefault();
        this.openDisclaimer();
        return false;
      };
    }
  }

  public changeOrderType(res) {
    this.isInstanceTrade = res;
  }

  public changeBlockchain(blockchain) {
    this.selectedBlockchain = blockchain;
  }

  ngOnInit() {
    // this.httpService.get(STAT_URL).subscribe(res => this.stat = res);
    new window['ScrollTopButton'](500);
    // this.openModal();
  }

  public openModal() {
    this.listingModal = this.dialog.open(this.listing, {
      width: '500px',
      panelClass: 'dialog-listing-container',
    });
  }
}
