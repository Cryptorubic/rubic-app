import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsTogglerService } from '../../services/forms-toggler/forms-toggler.service';
import { RefreshService } from '../../services/refresh-service/refresh.service';
import { REFRESH_STATUS } from '../../models/refresh-status';
import { map } from 'rxjs';
import { MAIN_FORM_TYPE, MainFormType } from '../../services/forms-toggler/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-header',
  templateUrl: './form-header.component.html',
  styleUrls: ['./form-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormHeaderComponent {
  public selectedForm$ = this.formsTogglerService.selectedForm$;

  public readonly isRefreshRotating$ = this.refreshService.status$.pipe(
    map(status => status !== REFRESH_STATUS.STOPPED)
  );

  constructor(
    private readonly formsTogglerService: FormsTogglerService,
    private readonly refreshService: RefreshService,
    private readonly router: Router
  ) {}

  public toggleForm(formType: MainFormType): void {
    if (formType === MAIN_FORM_TYPE.SWAP_FORM) {
      this.formsTogglerService.openSwapForm();
    } else {
      this.router.navigate(['/faucets']);
    }
  }

  public refreshTrades(): void {
    this.refreshService.onButtonClick();
  }
}
