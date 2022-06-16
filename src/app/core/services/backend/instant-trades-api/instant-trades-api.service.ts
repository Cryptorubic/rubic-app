import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import {
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS
} from '@shared/constants/blockchain/backend-blockchains';
import { TableToken, TableTrade } from '@shared/models/my-trades/table-trade';
import { InstantTradesPostApi } from '@core/services/backend/instant-trades-api/models/instant-trades-post-api';
import { InstantTradesResponseApi } from '@core/services/backend/instant-trades-api/models/instant-trades-response-api';
import { InstantTradeBotRequest } from '@core/services/backend/instant-trades-api/models/instant-trades-bot-request';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { HttpService } from '../../http/http.service';
import { BOT_URL } from 'src/app/core/services/backend/constants/bot-url';
import { BlockchainType } from '@shared/models/blockchain/blockchain-type';
import { AuthService } from '../../auth/auth.service';
import { BlockchainName, BLOCKCHAIN_NAME, InstantTrade, TradeType, Web3Pure } from 'rubic-sdk';
import WrapTrade from '@features/swaps/features/instant-trade/models/wrap-trade';
import { getItSwapParams } from '@shared/utils/utils';

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
  private static getHashObject(_blockchain: BlockchainName, hash: string): HashObject {
    return { hash };
  }

  constructor(
    private readonly httpService: HttpService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService
  ) {}

  public notifyInstantTradesBot(body: {
    provider: TradeType;
    blockchain: BlockchainName;
    walletAddress: string;
    trade: InstantTrade | WrapTrade;
    txHash: string;
  }): Promise<void> {
    const { fromAmount, toAmount, fromSymbol, toSymbol, fromPrice, blockchain, type } =
      getItSwapParams(body.trade);
    const { txHash, walletAddress } = body;
    const req: InstantTradeBotRequest = {
      fromAmount: fromAmount.toNumber(),
      toAmount: toAmount.toNumber(),
      fromSymbol: fromSymbol,
      toSymbol: toSymbol,
      price: fromPrice,
      txHash,
      walletAddress,
      blockchain,
      provider: type
    };

    return this.httpService.post<void>(BOT_URL.INSTANT_TRADES, req).toPromise();
  }

  /**
   * Sends request to add trade.
   * @return InstantTradesResponseApi Instant trade object.
   */
  public createTrade(
    hash: string,
    provider: TradeType,
    trade: InstantTrade | WrapTrade,
    fee?: number,
    promoCode?: string
  ): Observable<InstantTradesResponseApi> {
    const { blockchain, fromAmount, fromAddress, fromDecimals, toAmount, toDecimals, toAddress } =
      getItSwapParams(trade);
    const options = {
      blockchain: blockchain,
      fromAddress: fromAddress,
      fromAmount: Web3Pure.toWei(fromAmount, fromDecimals),
      toAddress: toAddress,
      toAmount: Web3Pure.toWei(toAmount, toDecimals)
    };
    const hashObject = InstantTradesApiService.getHashObject(blockchain, hash);
    const tradeInfo: InstantTradesPostApi = {
      network: TO_BACKEND_BLOCKCHAINS[options.blockchain],
      provider,
      from_token: options.fromAddress,
      to_token: options.toAddress,
      from_amount: options.fromAmount,
      to_amount: options.toAmount,
      user: this.authService.userAddress,
      fee,
      promocode: promoCode,
      ...hashObject
    };

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
    const body = {
      success,
      ...InstantTradesApiService.getHashObject(blockchain, hash),
      user: this.authService.userAddress
    };
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
        blockchain: FROM_BACKEND_BLOCKCHAINS[token.blockchain_network],
        symbol: token.symbol,
        amount: Web3Pure.fromWei(amount, token.decimals).toFixed(),
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
