import { Inject, Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';

import {
  BlockchainName,
  CrossChainTrade,
  CrossChainTradeType,
  NotWhitelistedProviderError,
  UnapprovedContractError,
  Web3Pure
} from 'rubic-sdk';
import { TO_BACKEND_BLOCKCHAINS } from '@app/shared/constants/blockchain/backend-blockchains';
import { firstValueFrom, Observable } from 'rxjs';
import { TO_BACKEND_CROSS_CHAIN_PROVIDERS } from './constants/to-backend-cross-chain-providers';
import { TradeParser } from '@features/swaps/features/instant-trade/services/instant-trade-service/utils/trade-parser';
import { delay } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WINDOW } from '@ng-web-apis/common';
import { ProviderStatisctic } from '@core/services/backend/cross-chain-routing-api/models/providers-statistics';
import { getSignature } from '@shared/utils/get-signature';

@Injectable({
  providedIn: 'root'
})
export class CrossChainApiService {
  private readonly apiEndpoint = 'crosschain_trades/trade';

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    @Inject(TUI_IS_MOBILE) private readonly isMobile: boolean,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  public saveNotWhitelistedProvider(
    error: NotWhitelistedProviderError,
    blockchain: BlockchainName,
    tradeType: CrossChainTradeType
  ): Observable<void> {
    return this.httpService.post(`info/new_provider`, {
      network: TO_BACKEND_BLOCKCHAINS[blockchain],
      title: TO_BACKEND_CROSS_CHAIN_PROVIDERS[tradeType],
      address: error.providerRouter + (error.providerGateway ? `_${error.providerGateway}` : ''),
      cause: error.cause
    });
  }

  public saveProvidersStatistics(data: ProviderStatisctic): Observable<void> {
    return this.httpService.post('route_calculation_statistic/save', data, null, {
      headers: {
        Signature: getSignature(data.to_token.toLowerCase(), data.from_token.toLowerCase())
      }
    });
  }

  public saveNotWhitelistedCcrProvider(
    error: UnapprovedContractError,
    blockchain: BlockchainName,
    tradeType: CrossChainTradeType
  ): Observable<void> {
    return this.httpService.post(`info/new_provider`, {
      network: TO_BACKEND_BLOCKCHAINS[blockchain],
      title: TO_BACKEND_CROSS_CHAIN_PROVIDERS[tradeType],
      address: error.contract,
      cause: error.cause,
      selector: error.method
    });
  }

  /**
   * Sends request to add trade.
   * @return InstantTradesResponseApi Instant trade object.
   */
  public async createTrade(
    hash: string,
    trade: CrossChainTrade,
    isSwapAndEarnSwapTrade: boolean
  ): Promise<void> {
    const {
      fromBlockchain,
      toBlockchain,
      fromAmount,
      fromAddress,
      fromDecimals,
      toAmount,
      toDecimals,
      toAddress
    } = TradeParser.getCrossChainSwapParams(trade);
    const tradeInfo = {
      from_network: TO_BACKEND_BLOCKCHAINS[fromBlockchain],
      to_network: TO_BACKEND_BLOCKCHAINS[toBlockchain],
      provider: TO_BACKEND_CROSS_CHAIN_PROVIDERS[trade.type],
      from_token: fromAddress,
      to_token: toAddress,
      from_amount: Web3Pure.toWei(fromAmount, fromDecimals),
      to_amount: Web3Pure.toWei(toAmount, toDecimals),
      user: this.authService.userAddress,
      tx_hash: hash,
      domain:
        this.window.location !== this.window.parent.location
          ? this.window.document.referrer
          : this.window.document.location.href
    };

    await firstValueFrom(
      this.httpService
        .post<void>(`${this.apiEndpoint}?valid=${isSwapAndEarnSwapTrade}`, tradeInfo)
        .pipe(delay(1000))
    );
  }

  /**
   * Sends request to update trade's status.
   * @param hash Hash of transaction what we want to update.
   * @param success If true status is `completed`, otherwise `cancelled`.
   * @return InstantTradesResponseApi Instant trade object.
   */
  public async patchTrade(hash: string, success: boolean): Promise<void> {
    const body = {
      success,
      hash,
      user: this.authService.userAddress
    };
    await firstValueFrom(this.httpService.patch(this.apiEndpoint, body));
  }
}
