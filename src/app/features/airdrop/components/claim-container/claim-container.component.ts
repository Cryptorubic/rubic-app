import { ChangeDetectionStrategy, Component, Inject, Input, Optional } from '@angular/core';
import { AirdropService } from '@features/airdrop/services/airdrop.service';
import { HeaderStore } from '@core/header/services/header.store';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { PolymorpheusInput } from '@shared/decorators/polymorpheus-input';
import { NumberedClaimTokensData } from '@app/shared/models/content/claim/claim-tokens-data';
import { ClaimRound } from '@app/shared/models/content/claim/claim-round';

@Component({
  selector: 'app-claim-container',
  templateUrl: './claim-container.component.html',
  styleUrls: ['./claim-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimContainerComponent {
  @PolymorpheusInput()
  @Input()
  isModal: boolean = this.context?.data?.isModal || false;

  public readonly rounds$ = this.airdropService.rounds$;

  public readonly isMobile$ = this.headerService.getMobileDisplayStatus();

  public readonly claimLoading$ = this.airdropService.claimLoading$;

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { isModal: boolean }>,
    private readonly airdropService: AirdropService,
    private readonly headerService: HeaderStore
  ) {}

  public trackByRoundNumber(_index: number, round: ClaimRound): number {
    return round.roundNumber;
  }

  public async handleClaim(roundData: NumberedClaimTokensData): Promise<void> {
    await this.airdropService.claimTokens(roundData.claimData, roundData.claimRound);
  }
}
