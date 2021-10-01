import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { GasService } from 'src/app/core/services/gas-service/gas.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

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
    this.gasPrice$ = this.gasService.getGasPrice$(BLOCKCHAIN_NAME.ETHEREUM);
  }
}
