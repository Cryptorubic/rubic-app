import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { List } from 'immutable';
import { tap } from 'rxjs/operators';
import { TransactionReceipt } from 'web3-eth';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { ethToXDaiDepositWallet } from 'src/app/shared/constants/bridge/deposit-wallets';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { BridgeToken } from 'src/app/features/bridge/models/BridgeToken';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { BlockchainsBridgeProvider } from '../blockchains-bridge-provider';

@Injectable()
export class EthereumXdaiBridgeProviderService extends BlockchainsBridgeProvider {
  private xDaiProviderTokens = [
    {
      symbol: 'DAI',
      image: '',
      rank: 0,

      blockchainToken: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
          address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          name: 'Dai',
          symbol: 'DAI',
          decimals: 18,

          minAmount: 0.005,
          maxAmount: 9999999
        },
        [BLOCKCHAIN_NAME.XDAI]: {
          address: NATIVE_TOKEN_ADDRESS,
          name: 'xDai',
          symbol: 'XDAI',
          decimals: 18,

          minAmount: 10,
          maxAmount: 9999999
        }
      }
    } as BridgeToken
  ];

  constructor(
    private readonly web3PrivateService: Web3PrivateService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly providerConnectorService: ProviderConnectorService
  ) {
    super();

    setTimeout(() => this.tokens$.next(List(this.xDaiProviderTokens)));
  }

  public getProviderType(): BRIDGE_PROVIDER {
    return BRIDGE_PROVIDER.XDAI;
  }

  public getFee(): Observable<number> {
    return of(0);
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const { token } = bridgeTrade;
    const tokenAddress = token.blockchainToken[bridgeTrade.fromBlockchain].address;
    const { decimals } = token.blockchainToken[bridgeTrade.fromBlockchain];
    const amountInWei = bridgeTrade.amount.multipliedBy(10 ** decimals);

    const onTradeTransactionHash = async hash => {
      if (bridgeTrade.onTransactionHash) {
        bridgeTrade.onTransactionHash(hash);
      }
      await this.bridgeApiService.postXDaiTransaction(hash);
    };

    return from(
      this.web3PrivateService.transferTokens(
        tokenAddress,
        ethToXDaiDepositWallet,
        amountInWei.toFixed(),
        {
          onTransactionHash: onTradeTransactionHash
        }
      )
    ).pipe(
      tap(receipt => {
        this.bridgeApiService.notifyBridgeBot(
          bridgeTrade,
          receipt.transactionHash,
          this.providerConnectorService.address
        );
      })
    );
  }

  public needApprove(): Observable<boolean> {
    return of(false);
  }

  approve(): Observable<TransactionReceipt> {
    return of(null);
  }
}
