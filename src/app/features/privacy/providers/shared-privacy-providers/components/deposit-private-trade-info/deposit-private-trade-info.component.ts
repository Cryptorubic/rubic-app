import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { of } from 'rxjs';
import { switchIif } from '@shared/utils/utils';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { depositInfoText } from './constants/cn-info-text';
import { TradeData } from './models/trade-data';

@Component({
  selector: 'app-deposit-private-trade-info',
  templateUrl: './deposit-private-trade-info.component.html',
  styleUrls: ['./deposit-private-trade-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositPrivateTradeInfoComponent {
  public readonly text = depositInfoText;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  @Input() public tradeData: TradeData;

  public readonly walletAddress$ = this.targetAddressService.address$.pipe(
    switchIif(
      Boolean,
      address => of(address),
      () => this.walletConnector.addressChange$
    )
  );

  constructor(
    private readonly walletConnector: WalletConnectorService,
    private readonly targetAddressService: TargetNetworkAddressService
  ) {}
}
