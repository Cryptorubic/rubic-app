import { ChangeDetectionStrategy, Component } from '@angular/core';
import { cnInfoText } from '@features/trade/components/cn-trade-info/constants/cn-info-text';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { map, of } from 'rxjs';
import { switchIif } from '@shared/utils/utils';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { CnSwapService } from '@features/trade/services/cn-swap/cn-swap.service';

@Component({
  selector: 'app-cn-trade-info',
  templateUrl: './cn-trade-info.component.html',
  styleUrls: ['./cn-trade-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CnTradeInfoComponent {
  public readonly text = cnInfoText;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly trade$ = this.cnSwapService.cnTrade$;

  public readonly extraField$ = this.trade$.pipe(
    map(trade =>
      trade?.extraField
        ? {
            name: trade.extraField.name,
            value: trade.extraField.value,
            text: `Please don’t forget to specify the ${trade.extraField.name} while sending the ${trade.fromToken.symbol} transaction for the exchange`
          }
        : null
    )
  );

  public readonly walletAddress$ = this.targetAddressService.address$.pipe(
    switchIif(
      Boolean,
      address => of(address),
      () => this.walletConnector.addressChange$
    )
  );

  constructor(
    private readonly tradeStateService: SwapsStateService,
    private readonly walletConnector: WalletConnectorService,
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly cnSwapService: CnSwapService
  ) {}
}
