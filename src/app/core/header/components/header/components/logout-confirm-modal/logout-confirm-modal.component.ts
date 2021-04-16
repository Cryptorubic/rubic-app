import { Component, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-logout-confirm-modal',
  templateUrl: './logout-confirm-modal.component.html',
  styleUrls: ['./logout-confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutConfirmModalComponent {
  private logoutConfirmationModal: MatDialogRef<any>;

  public logoutProgress: boolean;

  private closeModalEvent: Observable<any>;

  @ViewChild('logoutConfirmation') logoutConfirmation: TemplateRef<any>;

  constructor(
    private readonly authService: AuthService,
    private dialog: MatDialog,
    private readonly headerStore: HeaderStore
  ) {
    this.logoutProgress = false;
    this.headerStore.getConfirmModalOpeningStatus().subscribe((status: boolean) => {
      if (this.logoutConfirmation) {
        this.setupModalStatus(status);
      }
    });
  }

  private setupModalStatus(status: boolean) {
    const modalWidth = '480px';
    const modalPanelClass = 'custom-dialog-container';
    if (status) {
      this.logoutConfirmationModal = this.dialog.open(this.logoutConfirmation, {
        width: modalWidth,
        panelClass: modalPanelClass
      });
      this.closeModalEvent = this.logoutConfirmationModal.afterClosed();
      this.closeModalEvent.subscribe(() => {
        this.headerStore.setConfirmModalOpeningStatus(false);
      });
    } else if (this.logoutConfirmationModal) {
      this.logoutConfirmationModal.close();
    }
  }

  public confirmLogout(): void {
    this.logoutProgress = true;
    this.authService.signOut().subscribe(
      () => {
        this.headerStore.setConfirmModalOpeningStatus(false);
        this.logoutConfirmationModal.close();
      },
      () => {},
      () => {
        this.logoutProgress = false;
      }
    );
  }
}
