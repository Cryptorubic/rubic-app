import { Injectable } from '@angular/core';
import { ChainId, PendingRequest, Symbiosis, WaitForComplete } from 'symbiosis-js-sdk';
import { SYMBIOSIS_CONFIG } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/symbiosis/constants/symbiosis-config';
import { AuthService } from '@core/services/auth/auth.service';
import { TableTrade } from '@shared/models/my-trades/table-trade';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import BigNumber from 'bignumber.js';
import { firstValueFrom } from 'rxjs';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TuiDialogService } from '@taiga-ui/core';
import { UserRejectError } from '@core/errors/models/provider/user-reject-error';
import { SymbiosisWarningTxModalComponent } from '@features/my-trades/components/symbiosis-warning-tx-modal/symbiosis-warning-tx-modal.component';
import { TransactionReceipt } from 'web3-eth';
import { TransactionReceipt as EthersReceipt, Log as EthersLog } from '@ethersproject/providers';
import { BlockchainName } from '@app/shared/models/blockchain/blockchain-name';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { PublicBlockchainAdapterService } from '../blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { Token as SymbiosisToken } from 'symbiosis-js-sdk';

const CHAINS_PRIORITY = [
  ChainId.ETH_MAINNET,
  ChainId.BSC_MAINNET,
  ChainId.AVAX_MAINNET,
  ChainId.MATIC_MAINNET
];

@Injectable({
  providedIn: 'root'
})
export class SymbiosisService {
  private readonly symbiosis = new Symbiosis(SYMBIOSIS_CONFIG, 'rubic');

  private pendingRequests: PendingRequest[];

  private get walletAddress(): string {
    return this.authService.userAddress;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly iframeService: IframeService,
    private readonly dialogService: TuiDialogService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService
  ) {}

  public async getPendingRequests(): Promise<PendingRequest[]> {
    return await this.symbiosis.getPendingRequests(this.walletAddress);
  }

  public async waitForComplete(
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName,
    toToken: TokenAmount,
    receipt: TransactionReceipt
  ): Promise<EthersLog> {
    const fromChainId = BlockchainsInfo.getBlockchainByName(fromBlockchain).id as ChainId;
    const toChainId = BlockchainsInfo.getBlockchainByName(toBlockchain).id as ChainId;
    const toBlockchainAdapter = this.publicBlockchainAdapterService[toBlockchain];
    const tokenOut = new SymbiosisToken({
      chainId: toChainId,
      address: toBlockchainAdapter.isNativeAddress(toToken.address) ? '' : toToken.address,
      decimals: toToken.decimals,
      isNative: toBlockchainAdapter.isNativeAddress(toToken.address)
    });

    return await new WaitForComplete({
      direction: this.getDirection(fromChainId, toChainId),
      symbiosis: this.symbiosis,
      revertableAddress: this.walletAddress,
      tokenOut: tokenOut,
      chainIdIn: fromChainId
    }).waitForComplete(receipt as unknown as EthersReceipt);
  }

  public async getUserTrades(): Promise<TableTrade[]> {
    const pendingRequests = await this.symbiosis.getPendingRequests(this.walletAddress);
    this.pendingRequests = pendingRequests;

    return Promise.all(
      pendingRequests.map(async request => {
        const fromBlockchain = BlockchainsInfo.getBlockchainById(request.chainIdFrom).name;
        const toBlockchain = BlockchainsInfo.getBlockchainById(request.chainIdTo).name;

        return {
          fromTransactionHash: request.transactionHash,
          status: TRANSACTION_STATUS.DEPOSIT_IN_PROGRESS,
          provider: 'SYMBIOSIS_PROVIDER',
          fromToken: {
            blockchain: fromBlockchain,
            symbol: '',
            image: '',
            amount: ''
          },
          toToken: {
            blockchain: toBlockchain,
            symbol: '',
            image: '',
            amount: ''
          },
          date: new Date()
        };
      })
    );
  }

  public async revertTrade(
    hash: string,
    onTransactionHash: (hash: string) => void
  ): Promise<TransactionReceipt> {
    const requests = await this.getPendingRequests();
    const request = requests.find(pendingRequest => pendingRequest.transactionHash === hash);

    const toBlockchain = BlockchainsInfo.getBlockchainById(request.chainIdTo).name;
    this.walletConnectorService.checkSettings(toBlockchain);

    try {
      const size = this.iframeService.isIframe ? 'fullscreen' : 's';

      const amount = request.fromTokenAmount.toFixed();
      const tokenSymbol = request.fromTokenAmount.token.symbol;
      const tokenAddress = request.fromTokenAmount.token.address;
      const blockchain = BlockchainsInfo.getBlockchainById(request.chainIdFrom).name;

      await firstValueFrom(
        this.dialogService.open(new PolymorpheusComponent(SymbiosisWarningTxModalComponent), {
          size,
          data: {
            amount,
            tokenSymbol,
            tokenAddress,
            blockchain
          }
        })
      );
    } catch (_err) {
      throw new UserRejectError();
    }

    const { transactionRequest } = await this.symbiosis.newRevertPending(request).revert();

    return await this.web3PrivateService.trySendTransaction(
      transactionRequest.to,
      new BigNumber(transactionRequest.value?.toString() || 0),
      {
        data: transactionRequest.data.toString(),
        onTransactionHash
      }
    );
  }

  // TODO use function from sdk after new version is released
  // implementation taken from https://github.com/symbiosis-finance/js-sdk/blob/890f2ba6781cf97180c478c60b41f97134e3c070/src/crosschain/transit.ts#L33
  private getDirection(chainIdIn: ChainId, chainIdOut: ChainId): 'burn' | 'mint' {
    const indexIn = CHAINS_PRIORITY.indexOf(chainIdIn);
    const indexOut = CHAINS_PRIORITY.indexOf(chainIdOut);

    return indexIn > indexOut ? 'burn' : 'mint';
  }
}
