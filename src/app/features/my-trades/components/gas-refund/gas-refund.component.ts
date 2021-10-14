import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Promotion } from 'src/app/features/my-trades/models/promotion';
import { GasRefundService } from 'src/app/features/my-trades/services/gas-refund.service';
import { watch } from '@taiga-ui/cdk';
import { ScannerLinkPipe } from 'src/app/shared/pipes/scanner-link.pipe';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';

@Component({
  selector: 'app-gas-refund',
  templateUrl: './gas-refund.component.html',
  styleUrls: ['./gas-refund.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GasRefundComponent {
  public userPromotions$: Observable<Promotion[]>;

  public isLoading = false;

  constructor(
    private gasRefundService: GasRefundService,
    private cdr: ChangeDetectorRef,
    private scannerLinkPipe: ScannerLinkPipe
  ) {
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

  public openInExplorer(hash: string, blockchain: BLOCKCHAIN_NAME) {
    const link = this.scannerLinkPipe.transform(hash, blockchain, ADDRESS_TYPE.TRANSACTION);
    window.open(link, '_blank').focus();
  }

  public onRefundClick() {}
}
