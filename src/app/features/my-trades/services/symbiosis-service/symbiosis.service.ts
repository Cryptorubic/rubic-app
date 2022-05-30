import { Injectable } from '@angular/core';
import { PendingRequest, Symbiosis } from 'symbiosis-js-sdk';
import { SYMBIOSIS_CONFIG } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/symbiosis/constants/symbiosis-config';
import { AuthService } from '@core/services/auth/auth.service';
import { TableTrade } from '@shared/models/my-trades/table-trade';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import BigNumber from 'bignumber.js';

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
    private readonly walletConnectorService: WalletConnectorService
  ) {}

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

  public async revertTrade(hash: string, onTransactionHash: (hash: string) => void): Promise<void> {
    const request = this.pendingRequests.find(
      pendingRequest => pendingRequest.transactionHash === hash
    );

    const toBlockchain = BlockchainsInfo.getBlockchainById(request.chainIdTo).name;
    this.walletConnectorService.checkSettings(toBlockchain);

    const { transactionRequest } = await this.symbiosis.newRevertPending(request).revert();
    await this.web3PrivateService.trySendTransaction(
      transactionRequest.to,
      new BigNumber(transactionRequest.value?.toString() || 0),
      {
        data: transactionRequest.data.toString(),
        onTransactionHash
      }
    );
  }
}
