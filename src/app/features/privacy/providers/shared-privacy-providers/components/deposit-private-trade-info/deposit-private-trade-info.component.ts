import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { of } from 'rxjs';
import { switchIif } from '@shared/utils/utils';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { depositInfoText } from './constants/cn-info-text';
import { TradeInfo } from './models/trade-info';
import { DepositTradeData } from '../../models/deposit-trade-data';
import { CrossChainTransferTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-deposit-private-trade-info',
  templateUrl: './deposit-private-trade-info.component.html',
  styleUrls: ['./deposit-private-trade-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class DepositPrivateTradeInfoComponent implements OnChanges {
  public readonly text = depositInfoText;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  @Input() public inputData: DepositTradeData;

  @Input({ required: true }) public receiverCtrl: FormControl<string> = new FormControl('');

  public tradeInfo: TradeInfo;

  public readonly walletAddress$ = this.receiverCtrl.valueChanges.pipe(
    switchIif(
      Boolean,
      address => of(address),
      () => this.walletConnector.addressChange$
    )
  );

  constructor(private readonly walletConnector: WalletConnectorService) {}

  ngOnChanges(): void {
    if (this.inputData) {
      const { trade, paymentInfo } = this.inputData;
      this.tradeInfo = paymentInfo
        ? {
            id: paymentInfo.id,
            trade: trade as CrossChainTransferTrade,
            extraField: paymentInfo.extraField
              ? {
                  name: paymentInfo?.extraField.name,
                  value: paymentInfo?.extraField.value,
                  text: `Please don’t forget to specify the ${paymentInfo?.extraField.name} while sending the ${trade.from.symbol} transaction for the exchange`
                }
              : null
          }
        : null;
    }
  }
}
