import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-token-sale-page',
  templateUrl: './token-sale.component.html',
  styleUrls: ['./token-sale.component.scss']
})
export class TokenSaleComponent {
  @ViewChild('tokenSaleModal', { static: true }) tokenSale: TemplateRef<any>;

  protected tokenSaleModal: MatDialogRef<any>;

  public tsmodalStep = false;

  public confirmCheckbox = false;

  public addressCopy = false;

  public tokenSaleEnd = false;

  public tokenSaleFullEnd = true;

  public tokenSaleTime = 1600783200000;

  constructor(private dialog: MatDialog, protected route: ActivatedRoute) {
    const routeSub = this.route.queryParams.subscribe(params => {
      this.tokenSaleTime = +params.tsEndDate || this.tokenSaleTime;
    });

    routeSub.unsubscribe();

    this.tokenSaleEnd = new Date(this.tokenSaleTime).getTime() < new Date().getTime();
  }

  public openModal() {
    if (this.tokenSaleEnd) {
      this.confirmCheckbox = false;
      this.tsmodalStep = false;

      this.tokenSaleModal = this.dialog.open(this.tokenSale, {
        width: '650px',
        panelClass: 'dialog-ts-container'
      });
    }
  }

  public countdownEvent(state) {
    this.tokenSaleEnd = state;
  }

  public onCopied() {
    this.addressCopy = true;

    setTimeout(() => {
      this.addressCopy = false;
    }, 2500);
  }
}
