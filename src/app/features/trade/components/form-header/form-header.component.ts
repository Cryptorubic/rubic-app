import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RefreshService } from '../../services/refresh-service/refresh.service';
import { REFRESH_STATUS } from '../../models/refresh-status';
import { map } from 'rxjs';
import { ChartService } from '../../services/chart-service/chart.service';
import { FormsTogglerService } from '../../services/forms-toggler/forms-toggler.service';
import { MAIN_FORM_TYPE, MainFormType } from '../../services/forms-toggler/models';

export const FORMS_TYPE: { formType: MainFormType; text: string }[] = [
  {
    formType: MAIN_FORM_TYPE.SWAP_FORM,
    text: 'Public Swap'
  },
  {
    formType: MAIN_FORM_TYPE.DEPOSIT,
    text: 'Deposit'
  },
  {
    formType: MAIN_FORM_TYPE.PRIVATE_SWAP_FORM,
    text: 'Private Swap'
  },
  {
    formType: MAIN_FORM_TYPE.WITHDRAW,
    text: 'Withdraw'
  },
  {
    formType: MAIN_FORM_TYPE.TRANSFER,
    text: 'Transfer'
  }
];

@Component({
  selector: 'app-form-header',
  templateUrl: './form-header.component.html',
  styleUrls: ['./form-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormHeaderComponent {
  public readonly isRefreshRotating$ = this.refreshService.status$.pipe(
    map(status => status !== REFRESH_STATUS.STOPPED)
  );

  public readonly forms = FORMS_TYPE;

  public readonly chartInfo$ = this.chartService.chartInfo$;

  public readonly selectedForm$ = this.formsTooglerService.selectedForm$;

  constructor(
    private readonly refreshService: RefreshService,
    private readonly chartService: ChartService,
    private readonly formsTooglerService: FormsTogglerService
  ) {}

  public refreshTrades(): void {
    this.refreshService.onButtonClick();
  }

  public toggleChart(): void {
    const lastOpened = this.chartService.chartInfo.status.opened;
    this.chartService.setChartOpened(!lastOpened, {
      rewriteLastOpened: true,
      forceClosed: lastOpened
    });
  }

  public toogleForm(type: MainFormType): void {
    this.formsTooglerService.toogleForm(type);
  }
}
