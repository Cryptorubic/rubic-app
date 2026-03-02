import {
  BLOCKCHAIN_NAME,
  BlockchainsInfo,
  CHAIN_TYPE,
  OnChainTradeType,
  QuoteRequestInterface,
  QuoteResponseInterface
} from '@cryptorubic/core';
import { CROSS_CHAIN_TRADE_TYPE } from '../cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainTrade } from '../cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { WrappedCrossChainTrade } from '../cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';
import { EddyBridgeTrade } from '../cross-chain/calculation-manager/providers/eddy-bridge/eddy-bridge-trade';
import { OnChainTrade } from '../on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { WrappedOnChainTradeOrNull } from '../on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';
import { EvmApiCrossChainTrade } from './chains/evm/evm-api-cross-chain-trade';
import { EvmApiOnChainTrade } from './chains/evm/evm-api-on-chain-trade';
import { SolanaApiCrossChainTrade } from './chains/solana/solana-api-cross-chain-trade';
import { SolanaApiOnChainTrade } from './chains/solana/solana-api-on-chain-trade';
import { SuiApiOnChainTrade } from './chains/sui/sui-api-on-chain-trade';
import { SuiApiOnChainConstructor } from './chains/sui/sui-api-on-chain-trade-constructor';
import { TonApiCrossChainTrade } from './chains/ton/ton-api-cross-chain-trade';
import { TonApiOnChainTrade } from './chains/ton/ton-api-on-chain-trade';
import { TronApiCrossChainTrade } from './chains/tron/tron-api-cross-chain-trade';

import {
  transferTradeSupportedProviders,
  TransferTradeType
} from '../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/constans/transfer-trade-supported-providers';
import { BitcoinApiCrossChainConstructor } from './chains/bitcoin/bitcoin-api-cross-chain-constructor';
import { BitcoinApiCrossChainTrade } from './chains/bitcoin/bitcoin-api-cross-chain-trade';
import { EvmApiCrossChainConstructor } from './chains/evm/evm-api-cross-chain-constructor';
import { EvmApiOnChainConstructor } from './chains/evm/evm-api-on-chain-constructor';
import { SolanaApiCrossChainConstructor } from './chains/solana/solana-api-cross-chain-constructor';
import { SolanaApiOnChainConstructor } from './chains/solana/solana-api-on-chain-constructor';
import { TonApiCrossChainConstructor } from './chains/ton/ton-api-cross-chain-constructor';
import { TonApiOnChainConstructor } from './chains/ton/ton-api-on-chain-constructor';
import { ApiCrossChainTransferTrade } from './chains/transfer-trade/api-cross-chain-transfer-trade';
import { TronApiCrossChainConstructor } from './chains/tron/tron-api-cross-chain-constructor';
import { RubicApiError } from './models/rubic-api-error';
import { RubicApiParser } from './utils/rubic-api-parser';
import { RubicApiUtils } from './utils/rubic-api-utils';
import { shouldCalculateConsumedParamsProviders } from './chains/solana/constants/should-calculate-consumed-params';
import { ArbitrumRbcBridgeTrade } from '../cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/arbitrum-rbc-bridge-trade';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { SdkLegacyService } from '../../sdk-legacy.service';
import { RubicApiService } from '../../rubic-api/rubic-api.service';
import { StellarApiCrossChainTrade } from './chains/stellar/stellar-api-cross-chain-trade';
import { StellarApiCrossChainConstructor } from './chains/stellar/stellar-api-cross-chain-constructor';
import { StellarApiOnChainTrade } from './chains/stellar/stellar-api-on-chain-trade';
import { StellarApiOnChainConstructor } from './chains/stellar/stellar-api-on-chain-constructor';
import { NEED_TRUSTLINE_TRANSIT_TOKENS } from './chains/stellar/constants/need-trustline-transit-tokens';
import { TronApiOnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/ws-api/chains/tron/tron-api-on-chain-trade';

export class TransformUtils {
  public static async transformCrossChain(
    res: QuoteResponseInterface,
    quote: QuoteRequestInterface,
    _integratorAddress: string,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService,
    err?: RubicApiError
  ): Promise<WrappedCrossChainTrade> {
    if (!res && !err) {
      throw new RubicError('Currently, Rubic does not support swaps between these tokens.');
    }
    const tradeType = (res?.providerType || err?.type) as WrappedCrossChainTrade['tradeType'];
    const tradeParams = await RubicApiUtils.getTradeParams(
      quote,
      res,
      tradeType,
      sdkLegacyService.tokenService
    );

    const parsedError = err ? RubicApiParser.parseRubicApiErrors(err) : null;
    const parsedWarnings = RubicApiParser.parseRubicApiWarnings(res?.warnings || []);

    const error = parsedError || parsedWarnings.error;

    const chainType = BlockchainsInfo.getChainType(quote.srcTokenBlockchain);

    let trade: CrossChainTrade | null = null;

    const needProvidePubKey =
      tradeType === CROSS_CHAIN_TRADE_TYPE.TELE_SWAP &&
      tradeParams.from.blockchain === BLOCKCHAIN_NAME.BITCOIN;

    const isTransferTrade =
      transferTradeSupportedProviders.includes(tradeType as TransferTradeType) &&
      chainType !== CHAIN_TYPE.EVM;

    if (isTransferTrade) {
      trade = new ApiCrossChainTransferTrade(tradeParams, sdkLegacyService, rubicApiService);
    } else if (chainType === CHAIN_TYPE.EVM) {
      const params = tradeParams as EvmApiCrossChainConstructor;

      if (tradeType === CROSS_CHAIN_TRADE_TYPE.ARBITRUM) {
        trade = new ArbitrumRbcBridgeTrade(params, sdkLegacyService, rubicApiService);
      } else if (tradeType === CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE) {
        trade = new EddyBridgeTrade(params, sdkLegacyService, rubicApiService);
      } else {
        trade = new EvmApiCrossChainTrade(
          {
            ...params,
            needAuthWallet: parsedWarnings.needAuthWallet
          },
          sdkLegacyService,
          rubicApiService
        );
      }
    } else if (chainType === CHAIN_TYPE.TON) {
      trade = new TonApiCrossChainTrade(
        tradeParams as TonApiCrossChainConstructor,
        sdkLegacyService,
        rubicApiService
      );
    } else if (chainType === CHAIN_TYPE.TRON) {
      trade = new TronApiCrossChainTrade(
        tradeParams as TronApiCrossChainConstructor,
        sdkLegacyService,
        rubicApiService
      );
    } else if (chainType === CHAIN_TYPE.BITCOIN) {
      trade = new BitcoinApiCrossChainTrade(
        {
          ...tradeParams,
          needProvidePubKey
        } as BitcoinApiCrossChainConstructor,
        sdkLegacyService,
        rubicApiService
      );
    } else if (chainType === CHAIN_TYPE.SOLANA) {
      const shouldCalculateConsumedParams =
        shouldCalculateConsumedParamsProviders.includes(tradeType);

      trade = new SolanaApiCrossChainTrade(
        {
          ...tradeParams,
          shouldCalculateConsumedParams
        } as SolanaApiCrossChainConstructor,
        sdkLegacyService,
        rubicApiService
      );
    } else if (chainType === CHAIN_TYPE.STELLAR) {
      const trustlineTransitTokenAddress = NEED_TRUSTLINE_TRANSIT_TOKENS[tradeType] ?? null;

      trade = new StellarApiCrossChainTrade(
        tradeParams as StellarApiCrossChainConstructor,
        sdkLegacyService,
        rubicApiService,
        trustlineTransitTokenAddress
      );
    }

    return {
      trade,
      tradeType,
      ...(error && { error })
    };
  }

  public static async transformOnChain(
    response: QuoteResponseInterface,
    quote: QuoteRequestInterface,
    _integratorAddress: string,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService,
    err?: RubicApiError
  ): Promise<WrappedOnChainTradeOrNull> {
    if (!response && !err) {
      throw new RubicError('Currently, Rubic does not support swaps between these tokens.');
    }
    const tradeType = (response?.providerType || err?.type) as OnChainTradeType;
    const tradeParams = await RubicApiUtils.getTradeParams(
      quote,
      response,
      tradeType,
      sdkLegacyService.tokenService
    );

    const parsedError = err ? RubicApiParser.parseRubicApiErrors(err) : null;
    const parsedWarningsError = RubicApiParser.parseRubicApiWarnings(
      response?.warnings || []
    ).error;

    const error = parsedError || parsedWarningsError;

    const chainType = BlockchainsInfo.getChainType(quote.srcTokenBlockchain);

    let trade: OnChainTrade | null = null;

    if (chainType === CHAIN_TYPE.EVM) {
      trade = new EvmApiOnChainTrade(
        tradeParams as EvmApiOnChainConstructor,
        sdkLegacyService,
        rubicApiService
      );
    } else if (chainType === CHAIN_TYPE.TRON) {
      // trade = new TronApiOnChainTrade(
      //   tradeParams as TronApiOnChainConstructor,
      //   sdkLegacyService,
      //   rubicApiService
      // );
      trade = new ApiCrossChainTransferTrade(
        tradeParams,
        sdkLegacyService,
        rubicApiService
      ) as unknown as TronApiOnChainTrade;
    } else if (chainType === CHAIN_TYPE.SOLANA) {
      const shouldCalculateConsumedParams =
        shouldCalculateConsumedParamsProviders.includes(tradeType);
      trade = new SolanaApiOnChainTrade(
        {
          ...tradeParams,
          shouldCalculateConsumedParams
        } as SolanaApiOnChainConstructor,
        sdkLegacyService,
        rubicApiService
      );
    } else if (chainType === CHAIN_TYPE.TON) {
      trade = new TonApiOnChainTrade(
        {
          ...(tradeParams as TonApiOnChainConstructor),
          // @TODO API
          isChangedSlippage: false
        },
        sdkLegacyService,
        rubicApiService
      );
    } else if (chainType === CHAIN_TYPE.SUI) {
      trade = new SuiApiOnChainTrade(
        tradeParams as SuiApiOnChainConstructor,
        sdkLegacyService,
        rubicApiService
      );
    } else if (chainType === CHAIN_TYPE.STELLAR) {
      trade = new StellarApiOnChainTrade(
        tradeParams as StellarApiOnChainConstructor,
        sdkLegacyService,
        rubicApiService
      );
    }

    return {
      trade,
      tradeType,
      ...(error && { error })
    };
  }
}
