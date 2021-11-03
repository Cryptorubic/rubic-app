import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { startWith, takeUntil } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from '@shared/models/blockchain/ADDRESS_TYPE';

@Component({
  selector: 'app-bridge-swap-info',
  templateUrl: './bridge-swap-info.component.html',
  styleUrls: ['./bridge-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class BridgeSwapInfoComponent implements OnInit {
  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public isEthPolygon: boolean;

  constructor(
    private readonly swapFormService: SwapFormService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        this.isEthPolygon =
          (form.fromBlockchain === BLOCKCHAIN_NAME.POLYGON &&
            form.toBlockchain === BLOCKCHAIN_NAME.ETHEREUM) ||
          (form.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM &&
            form.toBlockchain === BLOCKCHAIN_NAME.POLYGON);
      });
  }
}
