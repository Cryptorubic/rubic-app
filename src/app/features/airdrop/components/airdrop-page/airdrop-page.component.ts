import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { AirdropService } from '@features/airdrop/services/airdrop.service';
import { AirdropPointsService } from '@shared/services/airdrop-points-service/airdrop-points.service';
import { HeaderStore } from '@core/header/services/header.store';
import { ModalService } from '@core/modals/services/modal.service';

@Component({
  selector: 'app-airdrop-page',
  templateUrl: './airdrop-page.component.html',
  styleUrls: ['./airdrop-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirdropPageComponent {
  public readonly points$ = this.airdropPointsService.points$;

  public readonly loadingClaim$ = this.airdropService.fetchUserInfoLoading$;

  public readonly fetchError$ = this.airdropService.fetchError$;

  public readonly loadingPoints$ = this.airdropPointsService.fetchUserPointsInfoLoading$;

  public readonly isAuth$ = this.airdropService.currentUser$;

  public readonly airdropUserInfo$ = this.airdropService.airdropUserInfo$;

  public readonly isMobile$ = this.headerService.getMobileDisplayStatus();

  public readonly rounds$ = this.airdropService.rounds$;

  constructor(
    private readonly headerService: HeaderStore,
    private readonly modalService: ModalService,
    private readonly airdropService: AirdropService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly airdropPointsService: AirdropPointsService
  ) {}
}
