import { AfterContentInit, AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DisclaimerComponent } from '../components/disclaimer/disclaimer.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-bridge',
  templateUrl: './bridge.component.html',
  styleUrls: ['./bridge.component.scss']
})
export class BridgeComponent implements OnInit, AfterViewInit {
  @ViewChild('disclaimerText', { static: true }) disclaimerText;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {}

  private openDisclaimer(): void {
    this.dialog.open(DisclaimerComponent, {
      width: '650px',
      disableClose: true,
      data: {
        text: 'DISCLAIMERS.START.TEXT',
        title: 'DISCLAIMERS.START.TITLE',
        actions: {}
      }
    });
  }

  ngAfterViewInit() {
    const link = this.disclaimerText.nativeElement.getElementsByClassName('as-link')[0];
    if (link) {
      link.onclick = event => {
        event.preventDefault();
        this.openDisclaimer();
        return false;
      };
    }
  }
}
