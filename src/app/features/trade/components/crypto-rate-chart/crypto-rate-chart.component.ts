import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChartService } from '../../services/chart-service/chart.service';

@Component({
  selector: 'app-crypto-rate-chart',
  templateUrl: './crypto-rate-chart.component.html',
  styleUrls: ['./crypto-rate-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoRateChartComponent {
  public readonly chartInfo$ = this.chartService.chartInfo$;

  constructor(private readonly chartService: ChartService) {}
}
