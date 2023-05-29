import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { CrossChainCalculatedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-calculated-trade';
import { BlockchainsInfo, ChangenowCrossChainTrade, CROSS_CHAIN_TRADE_TYPE } from 'rubic-sdk';
import {
  FetchedTonPromoInfo,
  ShortTonPromoInfo,
  TonPromoInfo,
  TonPromoUserInfo
} from '@features/swaps/features/cross-chain/services/ton-promo-service/models/ton-promo';
import { HttpService } from '@core/services/http/http.service';
import { getSignature } from '@shared/utils/get-signature';
import { Injectable } from '@angular/core';

@Injectable()
export class TonPromoService {
  private readonly _tonPromoPointsAmount$ = new BehaviorSubject<number>(0);

  public readonly tonPromoPointsAmount$ = this._tonPromoPointsAmount$.asObservable();

  constructor(private readonly httpService: HttpService) {}

  private async fetchTonPromoInfo(userWalletAddress: string): Promise<TonPromoInfo> {
    const { is_active, confirmed_rewards_amount } = await firstValueFrom(
      this.httpService.get<FetchedTonPromoInfo>('promo_campaigns/ton_crosschain_promo')
    );

    const { confirmed_trades } = await firstValueFrom(
      this.httpService.get<TonPromoUserInfo>(
        `promo_validations/user_validations?address=${userWalletAddress}`
      )
    );

    return {
      is_active,
      confirmed_rewards_amount,
      confirmed_trades
    };
  }

  public async getTonPromoInfo(
    calculatedTrade: CrossChainCalculatedTrade,
    userWalletAddress: string
  ): Promise<ShortTonPromoInfo> {
    const totalInputAmountInUSD = calculatedTrade.trade.from.price.multipliedBy(
      calculatedTrade.trade.from.tokenAmount
    );

    if (
      !BlockchainsInfo.isEvmBlockchainName(calculatedTrade.trade.from.blockchain) ||
      !(calculatedTrade.tradeType === CROSS_CHAIN_TRADE_TYPE.CHANGENOW) ||
      totalInputAmountInUSD.lt(20)
    ) {
      return { isTonPromoTrade: false, totalUserConfirmedTrades: 0 };
    }

    try {
      const { is_active, confirmed_rewards_amount, confirmed_trades } =
        await this.fetchTonPromoInfo(userWalletAddress);

      if (!is_active || !confirmed_rewards_amount || confirmed_trades === 3) {
        return { isTonPromoTrade: false, totalUserConfirmedTrades: 0 };
      }

      this.setTonPromoPointsAmount(confirmed_trades);

      return {
        isTonPromoTrade: confirmed_rewards_amount < 10_000 && is_active,
        totalUserConfirmedTrades: confirmed_trades
      };
    } catch (error) {
      return { isTonPromoTrade: false, totalUserConfirmedTrades: 0 };
    }
  }

  public async postTonPromoTradeInfo(
    trade: ChangenowCrossChainTrade,
    fromAddress: string,
    transactionHash: string
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `promo_validations/create_validation`,
        {
          address: fromAddress,
          tx_hash: transactionHash,
          change_now_tx_id: (trade as ChangenowCrossChainTrade).id
        },
        '',
        {
          headers: {
            Signature: getSignature(fromAddress, transactionHash)
          }
        }
      )
    );
  }

  public setTonPromoPointsAmount(totalUserConfirmedTrades: number): void {
    switch (totalUserConfirmedTrades) {
      case 0:
        this._tonPromoPointsAmount$.next(200);
        break;
      case 1:
      case 2:
        this._tonPromoPointsAmount$.next(100);
        break;

      default:
        this._tonPromoPointsAmount$.next(0);
        break;
    }
  }
}
