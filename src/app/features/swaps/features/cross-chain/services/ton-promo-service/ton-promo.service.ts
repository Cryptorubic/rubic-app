import { firstValueFrom } from 'rxjs';
import { CrossChainCalculatedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-calculated-trade';
import {
  BLOCKCHAIN_NAME,
  BlockchainsInfo,
  ChangenowCrossChainTrade,
  CROSS_CHAIN_TRADE_TYPE
} from 'rubic-sdk';
import {
  FetchedTonPromoInfo,
  ShortTonPromoInfo,
  TonPromoInfo,
  TonPromoUserInfo
} from '@features/swaps/features/cross-chain/services/ton-promo-service/models/ton-promo';
import { HttpService } from '@core/services/http/http.service';
import { getSignature } from '@shared/utils/get-signature';
import { Injectable } from '@angular/core';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';

@Injectable()
export class TonPromoService {
  constructor(
    private readonly httpService: HttpService,
    private readonly swapAndEarnStateService: SwapAndEarnStateService
  ) {}

  private async fetchTonPromoInfo(userWalletAddress: string): Promise<TonPromoInfo> {
    const [fetchedTonPromoInfo, fetchedTonPromoUserInfo] = await Promise.all([
      this.httpService.get<FetchedTonPromoInfo>('promo_campaigns/ton_crosschain_promo'),
      this.httpService.get<TonPromoUserInfo>(
        `promo_validations/user_validations?address=${userWalletAddress}`
      )
    ]);

    const tonPromoInfo = await firstValueFrom(fetchedTonPromoInfo);
    const tonPromoUserInfo = await firstValueFrom(fetchedTonPromoUserInfo);

    return {
      is_active: tonPromoInfo.is_active,
      confirmed_rewards_amount: tonPromoInfo.confirmed_rewards_amount,
      confirmed_trades: tonPromoUserInfo.confirmed_trades
    };
  }

  public async getTonPromoInfo(
    calculatedTrade: CrossChainCalculatedTrade,
    userWalletAddress: string
  ): Promise<ShortTonPromoInfo> {
    const emptyTonPromoInfo: ShortTonPromoInfo = {
      isTonPromoTrade: false,
      totalUserConfirmedTrades: 0
    };
    const totalInputAmountInUSD = calculatedTrade.trade.from.price.multipliedBy(
      calculatedTrade.trade.from.tokenAmount
    );

    if (
      !BlockchainsInfo.isEvmBlockchainName(calculatedTrade.trade.from.blockchain) ||
      !(calculatedTrade.trade.to.blockchain === BLOCKCHAIN_NAME.TON) ||
      !(calculatedTrade.tradeType === CROSS_CHAIN_TRADE_TYPE.CHANGENOW) ||
      totalInputAmountInUSD.lt(20)
    ) {
      return emptyTonPromoInfo;
    }

    try {
      const { is_active, confirmed_rewards_amount, confirmed_trades } =
        await this.fetchTonPromoInfo(userWalletAddress);

      if (!is_active || confirmed_rewards_amount >= 950_000 || confirmed_trades === 3) {
        return emptyTonPromoInfo;
      }

      return {
        isTonPromoTrade: is_active,
        totalUserConfirmedTrades: confirmed_trades
      };
    } catch (error) {
      return emptyTonPromoInfo;
    }
  }

  public async postTonPromoTradeInfo(
    trade: ChangenowCrossChainTrade,
    fromAddress: string,
    transactionHash: string
  ): Promise<void> {
    try {
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

      await this.swapAndEarnStateService.updateSwapToEarnUserInfo();
    } catch (error) {
      console.log(error);
    }
  }

  public getTonPromoPointsAmount(totalUserConfirmedTrades: number): number {
    if (totalUserConfirmedTrades === 0) {
      return 200;
    }

    if (totalUserConfirmedTrades === 1 || totalUserConfirmedTrades === 2) {
      return 100;
    }

    return 0;
  }
}
