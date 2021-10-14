import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Promotion } from 'src/app/features/my-trades/models/promotion';
import { GasRefundService } from 'src/app/features/my-trades/services/gas-refund.service';
import { watch } from '@taiga-ui/cdk';

@Component({
  selector: 'app-gas-refund',
  templateUrl: './gas-refund.component.html',
  styleUrls: ['./gas-refund.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GasRefundComponent {
  public userPromotions$: Observable<Promotion[]>;

  public isLoading = false;

  constructor(private gasRefundService: GasRefundService, private cdr: ChangeDetectorRef) {
    this.userPromotions$ = gasRefundService.userPromotions$;
  }

  public refreshRefunds() {
    this.isLoading = true;
    this.gasRefundService
      .updateUserPromotions()
      .pipe(watch(this.cdr))
      .subscribe(() => (this.isLoading = false));
  }

  public isButtonDisabled(refundDate: Date): boolean {
    return refundDate > new Date();
  }

  public onRefundClick() {}
}
