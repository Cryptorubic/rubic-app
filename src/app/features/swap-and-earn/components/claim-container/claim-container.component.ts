import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapAndEarnFacadeService } from '@features/swap-and-earn/services/swap-and-earn-facade.service';

@Component({
  selector: 'app-claim-container',
  templateUrl: './claim-container.component.html',
  styleUrls: ['./claim-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimContainerComponent {
  public readonly isAlreadyClaimed$ = this.swapAndEarnFacadeService.isAlreadyClaimed$;

  constructor(private readonly swapAndEarnFacadeService: SwapAndEarnFacadeService) {}
}
