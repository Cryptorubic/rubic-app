import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AirdropFacadeService } from '@features/swap-and-earn/services/airdrop/airdrop-facade.service';

@Component({
  selector: 'app-retrodrop-container',
  templateUrl: './retrodrop-container.component.html',
  styleUrls: ['./retrodrop-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetrodropContainerComponent {
  public readonly isAlreadyClaimed$ = this.airdropService.isAlreadyClaimed$;

  constructor(private readonly airdropService: AirdropFacadeService) {}
}
