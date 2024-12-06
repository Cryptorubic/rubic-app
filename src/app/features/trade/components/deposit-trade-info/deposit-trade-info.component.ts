import { ChangeDetectionStrategy, Component } from '@angular/core';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { map, of } from 'rxjs';
import { switchIif } from '@shared/utils/utils';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { DepositService } from '../../services/deposit/deposit.service';
import { depositInfoText } from './constants/cn-info-text';

@Component({
  selector: 'app-deposit-trade-info',
  templateUrl: './deposit-trade-info.component.html',
  styleUrls: ['./deposit-trade-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTradeInfoComponent {
  public readonly text = depositInfoText;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly trade$ = this.depositService.depositTrade$;

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
    private readonly walletConnector: WalletConnectorService,
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly depositService: DepositService
  ) {}
}
