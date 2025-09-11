import { Inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { OnChainTradeCreationToBackend } from '@core/services/backend/instant-trades-api/models/instant-trades-post-api';
import { InstantTradesResponseApi } from '@core/services/backend/instant-trades-api/models/instant-trades-response-api';
import { InstantTradeBotRequest } from '@core/services/backend/instant-trades-api/models/instant-trades-bot-request';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BOT_URL } from 'src/app/core/services/backend/constants/bot-url';
import {
  BlockchainName,
  NotWhitelistedProviderError,
  OnChainTrade,
  OnChainTradeType,
  TO_BACKEND_BLOCKCHAINS,
  UnapprovedContractError,
  UnapprovedMethodError,
  Web3Pure
} from '@cryptorubic/sdk';
import { TO_BACKEND_ON_CHAIN_PROVIDERS } from './constants/backend-providers';
import { HttpService } from '@core/services/http/http.service';
import { AuthService } from '@core/services/auth/auth.service';
import { TradeParser } from '@features/trade/utils/trade-parser';
import { SessionStorageService } from '@core/services/session-storage/session-storage.service';
import { SettingsService } from '../settings-service/settings.service';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { ProviderOnChainStatistic } from '@app/core/services/backend/cross-chain-routing-api/models/providers-statistics';
import { getSignature } from '@app/shared/utils/get-signature';
import { TargetNetworkAddressService } from '../target-network-address-service/target-network-address.service';

@Injectable()
export class OnChainApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly sessionStorage: SessionStorageService,
    private readonly settingsService: SettingsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    @Inject(TUI_IS_MOBILE) private readonly isMobile: boolean
  ) {}

  public notifyInstantTradesBot(body: {
    provider: OnChainTradeType;
    blockchain: BlockchainName;
    walletAddress: string;
    trade: OnChainTrade;
    txHash: string;
  }): Promise<void> {
    const { fromAmount, fromSymbol, toSymbol, fromPrice, blockchain, type } =
      TradeParser.getItSwapParams(body.trade);
    const { txHash, walletAddress } = body;
    const req: InstantTradeBotRequest = {
      fromAmount: fromAmount.toNumber(),
      toAmount: body.trade.lastTo.tokenAmount.toNumber(),
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
    provider: OnChainTradeType,
    trade: OnChainTrade,
    preTradeId?: string
  ): Observable<InstantTradesResponseApi> {
    const { blockchain, fromAddress, toAddress } = TradeParser.getItSwapParams(trade);
    const referral = this.sessionStorage.getItem('referral');
    const swapId = this.sessionStorage.getItem('swapId');
    const slippage = trade.getTradeInfo().slippage / 100;

    const backendProvider = TO_BACKEND_ON_CHAIN_PROVIDERS[provider];

    const tradeInfo: OnChainTradeCreationToBackend = {
      price_impact: trade.getTradeInfo().priceImpact,
      walletName: this.walletConnectorService.provider.walletName,
      deviceType: this.isMobile ? 'mobile' : 'desktop',
      slippage,
      expected_amount: trade.lastTo.stringWeiAmount,
      mevbot_protection: this.settingsService.instantTradeValue.useMevBotProtection,
      to_amount_min: trade.lastTo.weiAmountMinusSlippage(slippage).toFixed(0),
      network: TO_BACKEND_BLOCKCHAINS[blockchain],
      provider: backendProvider,
      from_token: fromAddress,
      to_token: toAddress,
      from_amount: trade.from.stringWeiAmount,
      to_amount: trade.lastTo.stringWeiAmount,
      user: this.authService.userAddress,
      receiver: this.targetNetworkAddressService.address || this.authService.userAddress,
      hash,
      ...(preTradeId && { pretrade_id: preTradeId }),
      ...(referral && { referrer: referral }),
      ...(swapId && { swap_id: swapId })
    };

    return this.httpService
      .post<InstantTradesResponseApi>('v2/trades/onchain/new_extended', tradeInfo)
      .pipe(delay(1000));
  }

  public saveNotWhitelistedProvider(
    error: NotWhitelistedProviderError,
    blockchain: BlockchainName,
    tradeType: OnChainTradeType
  ): Observable<void> {
    return this.httpService.post(`info/new_provider`, {
      network: TO_BACKEND_BLOCKCHAINS[blockchain],
      title: tradeType,
      address: error.providerRouter + (error.providerGateway ? `_${error.providerGateway}` : ''),
      cause: 'on-chain'
    });
  }

  public saveNotWhitelistedOnChainProvider(
    error: UnapprovedContractError | UnapprovedMethodError,
    blockchain: BlockchainName,
    tradeType: OnChainTradeType
  ): Observable<void> {
    if (error instanceof UnapprovedContractError) {
      return this.httpService.post(`info/new_provider`, {
        network: TO_BACKEND_BLOCKCHAINS[blockchain],
        title: tradeType,
        address: error.contract,
        cause: 'on-chain',
        selector: 'unknown'
      });
    } else {
      return this.httpService.post(`info/new_provider`, {
        network: TO_BACKEND_BLOCKCHAINS[blockchain],
        title: tradeType,
        address: 'unknown',
        cause: 'on-chain',
        selector: error.method
      });
    }
  }

  public saveProvidersStatistics(data: ProviderOnChainStatistic): Observable<void> {
    return this.httpService.post('onchain_route_calculation/save', data, null, {
      headers: {
        Signature: getSignature(data.to_token.toLowerCase(), data.from_token.toLowerCase())
      }
    });
  }

  public sendPreTradeInfo(trade: OnChainTrade): Promise<string> {
    const { blockchain, fromAmount, fromAddress, fromDecimals, toAddress } =
      TradeParser.getItSwapParams(trade);
    const referral = this.sessionStorage.getItem('referral');
    const backendProvider = TO_BACKEND_ON_CHAIN_PROVIDERS[trade.type];
    const slippage = trade.getTradeInfo().slippage / 100;

    const preTradeInfo: Omit<OnChainTradeCreationToBackend, 'pretrade_id'> = {
      price_impact: trade.getTradeInfo().priceImpact,
      walletName: this.walletConnectorService.provider.walletName,
      deviceType: this.isMobile ? 'mobile' : 'desktop',
      slippage,
      expected_amount: trade.to.stringWeiAmount,
      mevbot_protection: this.settingsService.instantTradeValue.useMevBotProtection,
      to_amount_min: trade.toTokenAmountMin.stringWeiAmount,
      network: TO_BACKEND_BLOCKCHAINS[blockchain],
      provider: backendProvider,
      from_token: fromAddress,
      to_token: toAddress,
      from_amount: Web3Pure.toWei(fromAmount, fromDecimals),
      to_amount: trade.to.stringWeiAmount,
      user: this.authService.userAddress,
      receiver: this.targetNetworkAddressService.address || this.authService.userAddress,
      ...(referral && { referrer: referral })
    };

    return firstValueFrom(
      this.httpService
        .post<{ pretrade_id: string }>('v2/trades/onchain/pretrade_new', preTradeInfo)
        .pipe(
          delay(1000),
          map(res => res.pretrade_id)
        )
    );
  }
}
