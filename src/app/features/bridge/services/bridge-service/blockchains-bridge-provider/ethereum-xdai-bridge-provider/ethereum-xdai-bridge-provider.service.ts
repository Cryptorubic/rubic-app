import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { List } from 'immutable';
import { tap } from 'rxjs/operators';
import { TransactionReceipt } from 'web3-eth';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { ethToXDaiDepositWallet } from 'src/app/shared/constants/bridge/deposit-wallets';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { BridgeTrade } from '@features/bridge/models/bridge-trade';
import { BridgeTokenPair } from '@features/bridge/models/bridge-token-pair';
import { NativeTokenAddress } from '@shared/constants/blockchain/native-token-address';
import { BridgeProvider } from '@shared/models/bridge/bridge-provider';
import { BlockchainsBridgeProvider } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/common/blockchains-bridge-provider';

@Injectable()
export class EthereumXdaiBridgeProviderService extends BlockchainsBridgeProvider {
  private xDaiProviderTokenPair: BridgeTokenPair[] = [
    {
      symbol: 'DAI',
      image: '',
      rank: 0,

      tokenByBlockchain: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
          blockchain: BLOCKCHAIN_NAME.ETHEREUM,
          address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          name: 'Dai',
          symbol: 'DAI',
          decimals: 18,

          minAmount: 0.005,
          maxAmount: 9999999
        },
        [BLOCKCHAIN_NAME.XDAI]: {
          blockchain: BLOCKCHAIN_NAME.XDAI,
          address: NativeTokenAddress,
          name: 'xDai',
          symbol: 'XDAI',
          decimals: 18,

          minAmount: 10,
          maxAmount: 9999999
        }
      }
    }
  ];

  constructor(
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    super();

    setTimeout(() => this._tokenPairs$.next(List(this.xDaiProviderTokenPair)));
  }

  public getProviderType(): BridgeProvider {
    return BridgeProvider.XDAI;
  }

  public getFee(): Observable<number> {
    return of(0);
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const { token } = bridgeTrade;
    const tokenAddress = token.tokenByBlockchain[bridgeTrade.fromBlockchain].address;
    const { decimals } = token.tokenByBlockchain[bridgeTrade.fromBlockchain];
    const amountInWei = bridgeTrade.amount.multipliedBy(10 ** decimals);

    const onTradeTransactionHash = async (hash: string) => {
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
          this.walletConnectorService.address
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
