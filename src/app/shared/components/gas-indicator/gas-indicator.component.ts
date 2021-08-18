import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { GasService } from 'src/app/core/services/gas-service/gas.service';

@Component({
  selector: 'app-gas-indicator',
  templateUrl: './gas-indicator.component.html',
  styleUrls: ['./gas-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GasIndicatorComponent {
  /**
   * Current gas price.
   */
  public gasPrice$: Observable<number>;

  constructor(private readonly gasService: GasService) {
    this.gasService.fetchGas();
    this.gasPrice$ = this.gasService.gasPrice;
  }
}
