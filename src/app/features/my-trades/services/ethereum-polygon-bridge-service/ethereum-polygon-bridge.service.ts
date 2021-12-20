import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import networks from 'src/app/shared/constants/blockchain/networks';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { TransactionReceipt } from 'web3-eth';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { MaticPOSClient } from 'rubic-app-maticjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';

@Injectable({
  providedIn: 'root'
})
export class EthereumPolygonBridgeService {
  constructor(
    private readonly bridgeApiService: BridgeApiService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  public depositTradeAfterCheckpoint(
    burnTransactionHash: string,
    onTransactionHash: (hash: string) => void
  ): Observable<TransactionReceipt> {
    const maticPOSClient = new MaticPOSClient({
      network: 'mainnet',
      version: 'v1',
      maticProvider: networks.find(n => n.name === BLOCKCHAIN_NAME.POLYGON).rpcLink,
      parentProvider: this.walletConnectorService.web3
    });
    const walletAddress = this.authService.userAddress;

    const onTradeTransactionHash = async (hash: string) => {
      if (onTransactionHash) {
        onTransactionHash(hash);
      }
      await this.bridgeApiService.patchPolygonTransaction(
        burnTransactionHash,
        hash,
        TRANSACTION_STATUS.WITHDRAW_IN_PROGRESS
      );
    };

    return defer(async () => {
      const receipt = await maticPOSClient.exitERC20(burnTransactionHash, {
        from: walletAddress,
        onTransactionHash: onTradeTransactionHash
      });
      await this.bridgeApiService.patchPolygonTransaction(
        burnTransactionHash,
        receipt.transactionHash,
        TRANSACTION_STATUS.COMPLETED
      );
      return receipt;
    });
  }
}
