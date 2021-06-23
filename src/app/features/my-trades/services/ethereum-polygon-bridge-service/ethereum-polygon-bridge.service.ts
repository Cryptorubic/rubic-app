import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TRADE_STATUS } from 'src/app/core/services/backend/bridge-api/models/TRADE_STATUS';
import { MaticPOSClient } from '@maticnetwork/maticjs';
import networks from 'src/app/shared/constants/blockchain/networks';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { TransactionReceipt } from 'web3-eth';

@Injectable()
export class EthereumPolygonBridgeService {
  constructor(
    private readonly bridgeApiService: BridgeApiService,
    private readonly providerConnectorService: ProviderConnectorService
  ) {}

  public depositTradeAfterCheckpoint(
    burnTransactionHash: string,
    onTransactionHash: (hash: string) => void
  ): Observable<TransactionReceipt> {
    const maticPOSClient = new MaticPOSClient({
      network: 'mainnet',
      version: 'v1',
      maticProvider: networks.find(n => n.name === BLOCKCHAIN_NAME.POLYGON).rpcLink,
      parentProvider: this.providerConnectorService.web3
    });
    const userAddress = this.providerConnectorService.address;

    const onTradeTransactionHash = async (hash: string) => {
      if (onTransactionHash) {
        onTransactionHash(hash);
      }
      await this.bridgeApiService.patchPolygonTransaction(
        burnTransactionHash,
        hash,
        TRADE_STATUS.WITHDRAW_IN_PROGRESS
      );
    };

    return defer(async () => {
      const receipt = await maticPOSClient.exitERC20(burnTransactionHash, {
        from: userAddress,
        onTransactionHash: onTradeTransactionHash
      });
      await this.bridgeApiService.patchPolygonTransaction(
        burnTransactionHash,
        receipt.transactionHash,
        TRADE_STATUS.COMPLETED
      );
      return receipt;
    });
  }
}
