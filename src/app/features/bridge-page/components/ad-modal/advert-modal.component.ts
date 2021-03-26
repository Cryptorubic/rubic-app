import {
  Component,
  ChangeDetectionStrategy,
  TemplateRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-advert-modal',
  templateUrl: './advert-modal.component.html',
  styleUrls: ['./advert-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvertModalComponent implements AfterViewInit {
  @ViewChild('modal') modal: TemplateRef<any>;

  private matModal: MatDialogRef<any>;

  constructor(private dialog: MatDialog, private readonly cookieService: CookieService) {}

  public ngAfterViewInit(): void {
    const isModalShown = Boolean(this.cookieService.get('bridge_modal_shown'));
    if (!isModalShown) {
      this.cookieService.set('bridge_modal_shown', '1', null, null, null, null, null);
      this.open();
    }
  }

  public open() {
    this.matModal = this.dialog.open(this.modal);
  }

  public close() {
    this.matModal.close();
  }
}
