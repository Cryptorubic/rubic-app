import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import BigNumber from 'bignumber.js';
import { EvmBlockchainName, Injector, RubicSdkError, Web3Pure } from 'rubic-sdk';
import { TokensService } from '@core/services/tokens/tokens.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { from, Observable } from 'rxjs';

interface TokenApproveData {
  address: string;
  spender: string;
  symbol: string;
  allowance: string;
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
  private readonly spenderAddress = this.context.data.spenderAddress;

  private readonly tokenAddress = this.context.data.tokenAddress;

  private readonly blockchain = this.context.data.blockchain;

  public readonly approveData$: Observable<TokenApproveData> = from(this.fetchApproveData());

  public loading = true;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, ContextData>,
    private readonly tokensService: TokensService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  private async fetchApproveData(): Promise<TokenApproveData> {
    try {
      const web3 = Injector.web3PublicService.getWeb3Public(this.blockchain);

      const { decimals, symbol } = await web3.callForTokenInfo(this.tokenAddress, [
        'decimals',
        'symbol'
      ]);

      const allowance = await web3.getAllowance(
        this.tokenAddress,
        this.walletConnectorService.address,
        this.spenderAddress
      );

      await new Promise(resolve => {
        setTimeout(resolve, 2_000);
      });
      const tokenDetails = await this.tokensService.findToken(
        { address: this.tokenAddress, blockchain: this.blockchain },
        true
      );

      this.loading = false;
      this.cdr.detectChanges();

      const maxApprove = new BigNumber(2).pow(256).minus(1);

      return {
        address: this.tokenAddress,
        spender: this.spenderAddress,
        symbol,
        image: tokenDetails?.image || 'assets/images/icons/coins/default-token-ico.svg',
        allowance: maxApprove.eq(allowance)
          ? 'Infinity'
          : Web3Pure.fromWei(allowance, Number(decimals)).toFixed()
      };
    } catch {}
  }

  public async handleRevoke(): Promise<void> {
    const allowance = await Injector.web3PublicService
      .getWeb3Public(this.blockchain)
      .getAllowance(this.tokenAddress, this.walletConnectorService.address, this.spenderAddress);
    if (allowance.eq(0)) {
      throw new RubicSdkError('Approve already revoked, token has 0 allowance');
    }
    await Injector.web3PrivateService
      .getWeb3PrivateByBlockchain(this.blockchain)
      .approveTokens(this.tokenAddress, this.spenderAddress, new BigNumber(0), {});
  }
}
