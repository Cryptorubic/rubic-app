import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';

@Component({
  selector: 'app-cross-chain-bottom-form',
  templateUrl: './cross-chain-bottom-form.component.html',
  styleUrls: ['./cross-chain-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CrossChainBottomFormComponent {
  @Output() tradeStatusChange = new EventEmitter<TRADE_STATUS>();

  public readonly TRADE_STATUS = TRADE_STATUS;

  public readonly displayTargetAddressInput$ =
    this.settingsService.crossChainRoutingValueChanges.pipe(
      startWith(this.settingsService.crossChainRoutingValue),
      map(settings => settings.showReceiverAddress)
    );

  public readonly tradeStatus$ = this.crossChainFormService.tradeStatus$;

  public readonly needApprove$ = this.crossChainFormService.selectedTrade$.pipe(
    map(trade => trade?.needApprove || false)
  );

  public readonly displayApproveButton$ = this.crossChainFormService.displayApproveButton$;

  public readonly criticalError$ = this.crossChainFormService.criticalError$;

  public readonly selectedTradeError$ = this.crossChainFormService.selectedTradeError$;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly crossChainFormService: CrossChainFormService
  ) {
    this.crossChainFormService.tradeStatus$.subscribe(status => {
      this.tradeStatusChange.emit(status);
    });
  }

  public onUpdateRate(): void {
    this.crossChainFormService.updateRate();
  }

  public onApproveTrade(): void {
    this.crossChainFormService.approveTrade();
  }

  public onSwapTrade(): void {
    this.crossChainFormService.swapTrade();
  }
}
