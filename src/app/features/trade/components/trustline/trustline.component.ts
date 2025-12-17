import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TrustlineService } from '../../services/trustline-service/trustline.service';
import { BehaviorSubject, map } from 'rxjs';
import { TargetNetworkAddressService } from '../../services/target-network-address-service/target-network-address.service';
import { PreviewSwapService } from '../../services/preview-swap/preview-swap.service';

@Component({
  selector: 'app-trustline',
  templateUrl: './trustline.component.html',
  styleUrls: ['./trustline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrustlineComponent {
  constructor(
    private readonly trustlineService: TrustlineService,
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly previewSwapService: PreviewSwapService
  ) {}

  public readonly showConnectWallet$ = this.targetAddressService.address$.pipe(map(Boolean));

  public readonly trustlineTokenSymbol$ = this.trustlineService.truslineToken$.pipe(
    map(token => token.symbol)
  );

  private readonly _truslineLoading$ = new BehaviorSubject(false);

  public readonly truslineLoading$ = this._truslineLoading$.asObservable();

  public async connectReceiver(): Promise<void> {
    await this.trustlineService.connectReceiverAddress();
  }

  public async addTristline(): Promise<void> {
    this._truslineLoading$.next(true);
    const hash = await this.trustlineService.addTrustline();

    if (hash) {
      this.previewSwapService.setNextTxState({
        step: 'idle',
        data: {}
      });
    }
    this._truslineLoading$.next(false);
  }
}
