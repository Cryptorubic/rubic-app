import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AirdropFacadeService } from '@features/swap-and-earn/services/airdrop/airdrop-facade.service';

@Component({
  selector: 'app-claim-container',
  templateUrl: './claim-container.component.html',
  styleUrls: ['./claim-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimContainerComponent {
  public readonly isAlreadyClaimed$ = this.airdropService.isAlreadyClaimed$;

  constructor(private readonly airdropService: AirdropFacadeService) {}
}
