import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import {
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS,
  ToBackendBlockchain
} from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TableToken, TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { InstantTradesPostApi } from 'src/app/core/services/backend/instant-trades-api/models/InstantTradesPostApi';
import { InstantTradesResponseApi } from 'src/app/core/services/backend/instant-trades-api/models/InstantTradesResponseApi';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';
import { InstantTradeBotRequest } from 'src/app/core/services/backend/instant-trades-api/models/InstantTradesBotRequest';
import { Web3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/web3-public';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { HttpService } from '../../http/http.service';
import { BOT_URL } from '../constants/BOT_URL';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';
import { BlockchainType } from '@shared/models/blockchain/blockchain-type';

type HashObject = { hash: string } | { signature: string };

const instantTradesApiRoutes = {
  createData: (networkType: BlockchainType) => `instant_trades/${networkType.toLowerCase()}`,
  editData: (networkType: BlockchainType) => `instant_trades/${networkType.toLowerCase()}`,
  getData: (networkType: BlockchainType) => `instant_trades/${networkType.toLowerCase()}`
};

@Injectable({
  providedIn: 'root'
})
export class InstantTradesApiService {
  private isTestingMode: boolean;

  private static getHashObject(blockchain: BLOCKCHAIN_NAME, hash: string): HashObject {
    const blockchainType = BlockchainsInfo.getBlockchainType(blockchain);
    return {
      ...(blockchainType === 'ethLike' && { hash }),
      ...(blockchainType === 'solana' && { signature: hash })
    };
  }

  constructor(
    private httpService: HttpService,
    private useTestingModeService: UseTestingModeService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.useTestingModeService.isTestingMode.subscribe(res => (this.isTestingMode = res));
  }

  public notifyInstantTradesBot(body: {
    provider: INSTANT_TRADES_PROVIDER;
    blockchain: BLOCKCHAIN_NAME;
    walletAddress: string;
    trade: InstantTrade;
    txHash: string;
  }): Promise<void> {
    const { trade, ...props } = body;
    const req: InstantTradeBotRequest = {
      ...props,
      fromAmount: trade.from.amount.toNumber(),
      toAmount: trade.to.amount.toNumber(),
      fromSymbol: trade.from.token.symbol,
      toSymbol: trade.to.token.symbol,
      price: trade.from.token.price
    };

    return this.httpService.post<void>(BOT_URL.INSTANT_TRADES, req).toPromise();
  }

  /**
   * Sends request to add trade.
   * @return InstantTradesResponseApi Instant trade object.
   */
  public createTrade(
    hash: string,
    provider: INSTANT_TRADES_PROVIDER,
    trade: InstantTrade,
    blockchain: BLOCKCHAIN_NAME
  ): Observable<InstantTradesResponseApi> {
    const hashObject = InstantTradesApiService.getHashObject(blockchain, hash);
    const tradeInfo: InstantTradesPostApi = {
      network: TO_BACKEND_BLOCKCHAINS[blockchain as ToBackendBlockchain],
      provider,
      from_token: trade.from.token.address,
      to_token: trade.to.token.address,
      from_amount: Web3Public.toWei(trade.from.amount, trade.from.token.decimals),
      to_amount: Web3Public.toWei(trade.to.amount, trade.to.token.decimals),
      ...hashObject
    };

    if (this.isTestingMode) {
      tradeInfo.network = 'ethereum-test';
    }

    const url = instantTradesApiRoutes.createData(this.walletConnectorService.provider.walletType);
    return this.httpService.post<InstantTradesResponseApi>(url, tradeInfo).pipe(delay(1000));
  }

  /**
   * Sends request to update trade's status.
   * @param hash Hash of transaction what we want to update.
   * @param success If true status is `completed`, otherwise `cancelled`.
   * @return InstantTradesResponseApi Instant trade object.
   */
  public patchTrade(hash: string, success: boolean): Observable<InstantTradesResponseApi> {
    const blockchain =
      this.walletConnectorService.provider.walletType === 'solana'
        ? BLOCKCHAIN_NAME.SOLANA
        : BLOCKCHAIN_NAME.ETHEREUM;
    const body = { success, ...InstantTradesApiService.getHashObject(blockchain, hash) };
    const url = instantTradesApiRoutes.editData(this.walletConnectorService.provider.walletType);
    return this.httpService.patch(url, body);
  }

  /**
   * Sends request to get list of user's instant trades.
   * @param walletAddress Wallet address of user.
   * @param errorCallback Callback on error.
   * @return list List of trades.
   */
  public getUserTrades(
    walletAddress: string,
    errorCallback?: (error: unknown) => void
  ): Observable<TableTrade[]> {
    const url = instantTradesApiRoutes.getData(this.walletConnectorService.provider.walletType);
    return this.httpService.get(url, { user: walletAddress }).pipe(
      map((swaps: InstantTradesResponseApi[]) =>
        swaps.map(swap => this.parseTradeApiToTableTrade(swap))
      ),
      catchError((err: unknown) => {
        errorCallback?.(err);
        return of([]);
      })
    );
  }

  private parseTradeApiToTableTrade(tradeApi: InstantTradesResponseApi): TableTrade {
    function getTableToken(type: 'from' | 'to'): TableToken {
      const token = tradeApi[`${type}_token` as const];
      const amount = tradeApi[`${type}_amount` as const];
      return {
        blockchain:
          FROM_BACKEND_BLOCKCHAINS[
            token.blockchain_network as keyof typeof FROM_BACKEND_BLOCKCHAINS
          ],
        symbol: token.symbol,
        amount: Web3Public.fromWei(amount, token.decimals).toFixed(),
        image: token.image
      };
    }

    let provider;
    if ('contract' in tradeApi) {
      provider = tradeApi.contract.name;
    }
    if ('program' in tradeApi) {
      provider = tradeApi.program.name;
    }
    if (provider === 'pancakeswap_old') {
      provider = INSTANT_TRADES_PROVIDER.PANCAKESWAP;
    }

    let fromTransactionHash;
    if ('hash' in tradeApi) {
      fromTransactionHash = tradeApi.hash;
    }
    if ('signature' in tradeApi) {
      fromTransactionHash = tradeApi.signature;
    }

    return {
      fromTransactionHash,
      status: tradeApi.status,
      provider,
      fromToken: getTableToken('from'),
      toToken: getTableToken('to'),
      date: new Date(tradeApi.status_updated_at)
    };
  }
}
