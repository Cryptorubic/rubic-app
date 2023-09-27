import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AirdropService } from '@features/airdrop/services/airdrop.service';

@Component({
  selector: 'app-airdrop-page',
  templateUrl: './airdrop-page.component.html',
  styleUrls: ['./airdrop-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirdropPageComponent {
  public readonly loadingClaim$ = this.airdropService.fetchUserInfoLoading$;

  public readonly loadingPoints$ = this.airdropService.fetchUserPointsInfoLoading$;

  constructor(private readonly airdropService: AirdropService) {}
}
