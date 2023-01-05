import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import BigNumber from 'bignumber.js';
import { EvmBlockchainName, Injector, Web3Pure } from 'rubic-sdk';
import { TokensService } from '@core/services/tokens/tokens.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { from, Observable } from 'rxjs';

interface TokenApproveData {
  address: string;
  spender: string;
  symbol: string;
  allowance: BigNumber;
  image: string;
}

interface ContextData {
  spenderAddress: string;
  tokenAddress: string;
  blockchain: EvmBlockchainName;
}

@Component({
  selector: 'app-revoke-modal',
  templateUrl: './revoke-modal.component.html',
  styleUrls: ['./revoke-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevokeModalComponent {
  public readonly approveData$: Observable<TokenApproveData> = from(this.fetchApproveData());

  public loading = true;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, ContextData>,
    private readonly tokensService: TokensService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  private async fetchApproveData(): Promise<TokenApproveData> {
    try {
      const spenderAddress = this.context.data.spenderAddress;
      const tokenAddress = this.context.data.tokenAddress;
      const blockchain = this.context.data.blockchain;

      const web3 = Injector.web3PublicService.getWeb3Public(blockchain);

      const { decimals, symbol } = await web3.callForTokenInfo(tokenAddress, [
        'decimals',
        'symbol'
      ]);

      const allowance = await web3.getAllowance(
        tokenAddress,
        this.walletConnectorService.address,
        spenderAddress
      );

      await new Promise(resolve => {
        setTimeout(resolve, 2000);
      });
      const tokenDetails = await this.tokensService.findToken(
        { address: tokenAddress, blockchain },
        true
      );

      // this.loading = false;

      return {
        address: tokenAddress,
        spender: spenderAddress,
        symbol,
        image: tokenDetails?.image || 'assets/images/icons/coins/default-token-ico.svg',
        allowance: Web3Pure.fromWei(allowance, Number(decimals))
      };
    } catch {}
  }
}
