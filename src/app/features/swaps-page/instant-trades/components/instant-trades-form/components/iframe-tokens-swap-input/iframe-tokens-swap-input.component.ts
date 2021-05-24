import { Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { InstantTradeSwapInput } from '../../../../models/instant-trade-input';
import { InstantTradeProviderController } from '../../../../models/instant-trades-provider-controller';
import { BLOCKCHAIN_NAME } from '../../../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PrivateService } from '../../../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { AuthService } from '../../../../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-iframe-tokens-swap-input',
  templateUrl: './iframe-tokens-swap-input.component.html',
  styleUrls: ['./iframe-tokens-swap-input.component.scss']
})
export class IframeTokensSwapInputComponent extends InstantTradeSwapInput {
  @Input() public disableSelection: boolean;

  public get tradeController(): InstantTradeProviderController {
    return this.trades[this.index];
  }

  public get isLoggedIn(): boolean {
    return Boolean(this.web3Private.address);
  }

  public get gasFeeDisplayCondition(): BigNumber | undefined {
    return (
      this.blockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN &&
      this.blockchain !== BLOCKCHAIN_NAME.POLYGON &&
      this.tradeController?.trade?.gasFeeInEth &&
      this.tradeController?.trade?.gasFeeInUsd
    );
  }

  constructor(
    private readonly web3Private: Web3PrivateService,
    private readonly authService: AuthService
  ) {
    super();
    this.disableSelection = false;
  }

  public async login(): Promise<void> {
    await this.authService.iframeSignIn();
  }
}
