import { AfterViewInit, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProofInfo } from '@features/testnet-promo/interfaces/api-models';
import { TestnetPromoClaimService } from '@features/testnet-promo/services/testnet-promo-claim.service';
import { Web3Pure } from '@cryptorubic/sdk';

@Component({
  selector: 'app-active-claim',
  templateUrl: './active-claim.component.html',
  styleUrls: ['./active-claim.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveClaimComponent implements AfterViewInit {
  public readonly buttonState$ = this.claimService.buttonState$;

  public readonly buttonLabel$ = this.claimService.buttonLabel$;

  @Input({ required: true }) round: ProofInfo;

  constructor(private readonly claimService: TestnetPromoClaimService) {}

  public async handleButtonClick(): Promise<void> {
    await this.claimService.claimTokens(
      this.round.contractAddress,
      {
        index: this.round.index,
        amount: Web3Pure.toWei(this.round.amount),
        account: this.round.address
      },
      this.round.proof
    );
  }

  public ngAfterViewInit() {
    this.claimService.setClaimStatus(this.round.contractAddress, this.round.index);
  }
}
