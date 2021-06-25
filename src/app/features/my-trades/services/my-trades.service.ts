import { Injectable } from '@angular/core';
import { EthereumPolygonBridgeService } from 'src/app/features/my-trades/services/ethereum-polygon-bridge-service/ethereum-polygon-bridge.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TransactionReceipt } from 'web3-eth';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { UserRejectError } from 'src/app/shared/models/errors/provider/UserRejectError';

@Injectable()
export class MyTradesService {
  constructor(
    private readonly ethereumPolygonBridgeService: EthereumPolygonBridgeService,
    private readonly providerConnectorService: ProviderConnectorService
  ) {}

  private checkSettings(blockchain: BLOCKCHAIN_NAME): void {
    if (this.providerConnectorService.network?.name !== blockchain) {
      throw new NetworkError(blockchain);
    }
  }

  public depositPolygonBridgeTradeAfterCheckpoint(
    burnTransactionHash: string,
    onTransactionHash: (hash: string) => void
  ): Observable<TransactionReceipt> {
    try {
      this.checkSettings(BLOCKCHAIN_NAME.ETHEREUM);
    } catch (err) {
      return throwError(err);
    }

    return this.ethereumPolygonBridgeService
      .depositTradeAfterCheckpoint(burnTransactionHash, onTransactionHash)
      .pipe(
        catchError(err => {
          if (err.code === 4001) {
            return throwError(new UserRejectError());
          }
          return throwError(err);
        })
      );
  }
}
