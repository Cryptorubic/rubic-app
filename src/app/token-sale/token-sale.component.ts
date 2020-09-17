import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-token-sale-page',
  templateUrl: './token-sale.component.html',
  styleUrls: ['./token-sale.component.scss'],
})
export class TokenSaleComponent implements OnInit {
  @ViewChild('tokenSaleModal') tokenSale: TemplateRef<any>;

  protected tokenSaleModal: MatDialogRef<any>;

  public tsmodalStep = false;
  public confirmCheckbox = false;
  public addressCopy = false;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {}

  public openModal() {
    this.confirmCheckbox = false;

    this.tokenSaleModal = this.dialog.open(this.tokenSale, {
      width: '650px',
      panelClass: 'dialog-ts-container',
    });
  }

  public onCopied() {
    this.addressCopy = true;

    setTimeout(() => {
      this.addressCopy = false;
    }, 2500);
  }
}
