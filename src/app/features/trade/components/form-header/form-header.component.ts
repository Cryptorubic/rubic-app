import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RefreshService } from '../../services/refresh-service/refresh.service';
import { REFRESH_STATUS } from '../../models/refresh-status';
import { map } from 'rxjs';
import { ChartService } from '../../services/chart-service/chart.service';

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

  public readonly chartInfo$ = this.chartService.chartInfo$;

  constructor(
    private readonly refreshService: RefreshService,
    private readonly chartService: ChartService
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
}
