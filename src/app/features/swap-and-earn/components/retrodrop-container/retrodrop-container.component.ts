import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapAndEarnFacadeService } from '@features/swap-and-earn/services/swap-and-earn-facade.service';

@Component({
  selector: 'app-retrodrop-container',
  templateUrl: './retrodrop-container.component.html',
  styleUrls: ['./retrodrop-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetrodropContainerComponent {
  public readonly isAlreadyClaimed$ = this.swapAndEarnFacadeService.isAlreadyClaimed$;

  constructor(private readonly swapAndEarnFacadeService: SwapAndEarnFacadeService) {}
}
