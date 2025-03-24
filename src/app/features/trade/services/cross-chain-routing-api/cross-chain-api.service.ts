import { Inject, Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';

import {
  BlockchainName,
  ChangenowCrossChainTrade,
  CrossChainStatus,
  CrossChainTrade,
  CrossChainTradeType,
  NotWhitelistedProviderError,
  TO_BACKEND_BLOCKCHAINS,
  UnapprovedContractError,
  UnapprovedMethodError,
  Web3Pure
} from 'rubic-sdk';
import { firstValueFrom, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WINDOW } from '@ng-web-apis/common';
import { getSignature } from '@shared/utils/get-signature';
import { TradeParser } from '@features/trade/utils/trade-parser';
import { TO_BACKEND_CROSS_CHAIN_PROVIDERS } from '@core/services/backend/cross-chain-routing-api/constants/to-backend-cross-chain-providers';
import { SessionStorageService } from '@core/services/session-storage/session-storage.service';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { SettingsService } from '../settings-service/settings.service';
import { ProviderCcrStatistic } from '@app/core/services/backend/cross-chain-routing-api/models/providers-statistics';
import { TargetNetworkAddressService } from '../target-network-address-service/target-network-address.service';

@Injectable()
export class CrossChainApiService {
  private readonly apiEndpoint = 'v2/trades/crosschain/new_extended';

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly sessionStorage: SessionStorageService,
    private readonly settingsService: SettingsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
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
      cause: 'cross-chain'
    });
  }

  public saveProvidersStatistics(data: ProviderCcrStatistic): Observable<void> {
    return this.httpService.post('route_calculation_statistic/save', data, null, {
      headers: {
        Signature: getSignature(data.to_token.toLowerCase(), data.from_token.toLowerCase())
      }
    });
  }

  public saveNotWhitelistedCcrProvider(
    error: UnapprovedContractError | UnapprovedMethodError,
    blockchain: BlockchainName,
    tradeType: CrossChainTradeType
  ): Observable<void> {
    return this.httpService.post(`info/new_provider`, {
      network: TO_BACKEND_BLOCKCHAINS[blockchain],
      title: TO_BACKEND_CROSS_CHAIN_PROVIDERS[tradeType],
      address: error.contract,
      cause: 'cross-chain',
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
    preTradeId?: string
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
    const referral = this.sessionStorage.getItem('referral');
    const slippage = trade.getTradeInfo().slippage;

    const tradeInfo = {
      price_impact: trade.getTradeInfo().priceImpact,
      slippage,
      wallet_name: this.walletConnectorService.provider.walletName,
      device_type: this.isMobile ? 'mobile' : 'desktop',
      expected_amount: Web3Pure.toWei(toAmount, toDecimals),
      mevbot_protection: this.settingsService.crossChainRoutingValue.useMevBotProtection,
      to_amount_min: Web3Pure.toWei(trade.toTokenAmountMin, toDecimals),
      from_network: TO_BACKEND_BLOCKCHAINS[fromBlockchain],
      to_network: TO_BACKEND_BLOCKCHAINS[toBlockchain],
      provider: TO_BACKEND_CROSS_CHAIN_PROVIDERS[trade.type],
      from_token: fromAddress,
      to_token: toAddress,
      from_amount: Web3Pure.toWei(fromAmount, fromDecimals),
      to_amount: Web3Pure.toWei(toAmount, toDecimals),
      user: this.authService.userAddress,
      tx_hash: hash,
      receiver: this.targetNetworkAddressService.address || this.authService.userAddress,
      domain:
        this.window.location !== this.window.parent.location
          ? this.window.document.referrer
          : this.window.document.location.href,
      ...(preTradeId && { pretrade_id: preTradeId }),
      ...(trade instanceof ChangenowCrossChainTrade && { changenow_id: trade.changenowId }),
      ...('rangoRequestId' in trade && { rango_request_id: trade.rangoRequestId }),
      ...('squidrouterRequestId' in trade && {
        squidrouter_request_id: trade.squidrouterRequestId
      }),
      ...('simpleSwapId' in trade && { simpleswap_id: trade.simpleSwapId }),
      ...('retroBridgeId' in trade && { retrobridge_transaction_id: trade.retroBridgeId }),
      ...('changellyId' in trade && { changelly_id: trade.changellyId }),
      ...(referral && { referrer: referral })
    };

    await firstValueFrom(
      this.httpService.post<void>(this.apiEndpoint, tradeInfo).pipe(delay(1000))
    );
  }

  /**
   * Sends request to update trade's status.
   * @param hash Hash of transaction what we want to update.
   * @param success If true status is `completed`, otherwise `cancelled`.
   * @return InstantTradesResponseApi Instant trade object.
   */
  public async patchTrade(hash: string, success: boolean): Promise<void> {
    try {
      const body = {
        success,
        hash,
        user: this.authService.userAddress
      };
      const res = await firstValueFrom(this.httpService.patch<void>(this.apiEndpoint, body));

      return res;
    } catch (err) {
      throw new RubicError(err);
    }
  }

  public sendMesonSwapId(dstStatusInfo: CrossChainStatus, srcTxHash: string): void {
    this.httpService
      .post('v2/trades/crosschain/new_via_meson_trade', {
        source_tx_hash: srcTxHash,
        swap_id: dstStatusInfo.extraInfo?.mesonSwapId
      })
      .subscribe();
  }

  public async sendPreTradeInfo(trade: CrossChainTrade): Promise<string> {
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
    const referral = this.sessionStorage.getItem('referral');
    const slippage = trade.getTradeInfo().slippage;

    const preTradeInfo = {
      price_impact: trade.getTradeInfo().priceImpact,
      slippage,
      wallet_name: this.walletConnectorService.provider.walletName,
      device_type: this.isMobile ? 'mobile' : 'desktop',
      expected_amount: Web3Pure.toWei(toAmount, toDecimals),
      mevbot_protection: this.settingsService.crossChainRoutingValue.useMevBotProtection,
      to_amount_min: Web3Pure.toWei(trade.toTokenAmountMin, toDecimals),
      from_network: TO_BACKEND_BLOCKCHAINS[fromBlockchain],
      to_network: TO_BACKEND_BLOCKCHAINS[toBlockchain],
      provider: TO_BACKEND_CROSS_CHAIN_PROVIDERS[trade.type],
      from_token: fromAddress,
      to_token: toAddress,
      from_amount: Web3Pure.toWei(fromAmount, fromDecimals),
      to_amount: Web3Pure.toWei(toAmount, toDecimals),
      user: this.authService.userAddress,
      receiver: this.targetNetworkAddressService.address || this.authService.userAddress,
      domain:
        this.window.location !== this.window.parent.location
          ? this.window.document.referrer
          : this.window.document.location.href,
      ...(referral && { referrer: referral })
    };

    return firstValueFrom(
      this.httpService
        .post<{ pretrade_id: string }>('v2/trades/crosschain/pretrade_new', preTradeInfo)
        .pipe(
          delay(1000),
          map(res => res.pretrade_id)
        )
    );
  }
}
