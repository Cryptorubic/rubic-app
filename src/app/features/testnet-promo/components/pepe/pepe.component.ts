import { ChangeDetectionStrategy, Component, Inject, Injector, Input } from '@angular/core';
import { PageState } from '@features/testnet-promo/interfaces/page-state.interface';
import { ModalService } from '@core/modals/services/modal.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-pepe',
  templateUrl: './pepe.component.html',
  styleUrls: ['./pepe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PepeComponent {
  @Input({ required: true }) readonly state: PageState;

  constructor(
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly googleTagManagerService: GoogleTagManagerService
  ) {}

  public connectWallet(): void {
    this.modalService.openWalletModal(this.injector).subscribe();
  }

  public onVerifyLinkClick(): void {
    this.googleTagManagerService.fireClickOnVerifyEvent();
  }
}
