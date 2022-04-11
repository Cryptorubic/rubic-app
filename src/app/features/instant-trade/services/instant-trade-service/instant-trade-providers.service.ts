import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME, BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { OneInchEthService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/one-inch-eth-service/one-inch-eth.service';
import { UniSwapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { OneInchPolygonService } from '@features/instant-trade/services/instant-trade-service/providers/polygon/one-inch-polygon-service/one-inch-polygon.service';
import { QuickSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap.service';
import { PancakeSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap.service';
import { OneInchBscService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/one-inch-bsc-service/one-inch-bsc.service';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { SushiSwapPolygonService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/sushi-swap-polygon-service/sushi-swap-polygon.service';
import { SushiSwapEthService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/sushi-swap-eth-service/sushi-swap-eth.service';
import { SushiSwapBscService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/sushi-swap-bsc-service/sushi-swap-bsc.service';
import { SushiSwapHarmonyService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/harmony/sushi-swap-harmony/sushi-swap-harmony.service';
import { UniSwapV3EthereumService } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-ethereum-service/uni-swap-v3-ethereum.service';
import { SolarBeamMoonRiverService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/solarbeam-moonriver/solarbeam-moonriver.service';
import { SushiSwapMoonRiverService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/sushi-swap-moonriver/sushi-swap-moonriver.service';
import { SushiSwapAvalancheService } from '@features/instant-trade/services/instant-trade-service/providers/avalanche/sushi-swap-avalanche-service/sushi-swap-avalanche.service';
import { PangolinAvalancheService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche.service';
import { JoeAvalancheService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/joe-avalanche-service/joe-avalanche.service';
import { SushiSwapFantomService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/fantom/sushi-swap-fantom-service/sushi-swap-fantom-service.service';
import { SpookySwapFantomService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/fantom/spooky-swap-fantom-service/spooky-swap-fantom.service';
import { SpiritSwapFantomService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/fantom/spirit-swap-fantom-service/spirit-swap-fantom.service';
import { RaydiumService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/raydium.service';
import { AlgebraService } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/algebra.service';
import { ViperSwapHarmonyService } from '@features/instant-trade/services/instant-trade-service/providers/harmony/viper-swap-harmony/viper-swap-harmony.service';
import { UniSwapV3PolygonService } from '@features/instant-trade/services/instant-trade-service/providers/polygon/uni-swap-v3-polygon-service/uni-swap-v3-polygon.service';
import { SushiSwapArbitrumService } from '@features/instant-trade/services/instant-trade-service/providers/arbitrum/sushi-swap-arbitrum-service/sushi-swap-arbitrum.service';
import { OneInchArbitrumService } from '@features/instant-trade/services/instant-trade-service/providers/arbitrum/one-inch-arbitrum-service/one-inch-arbitrum.service';
import { UniSwapV3ArbitrumService } from '@features/instant-trade/services/instant-trade-service/providers/arbitrum/uni-swap-v3-arbitrum-service/uni-swap-v3-arbitrum.service';
import { TrisolarisAuroraService } from '@features/instant-trade/services/instant-trade-service/providers/aurora/trisolaris-aurora-service/trisolaris-aurora.service';
import { WannaSwapAuroraService } from '@features/instant-trade/services/instant-trade-service/providers/aurora/wanna-swap-aurora-service/wanna-swap-aurora.service';
import { RefFinanceService } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance.service';
import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { ZrxEthService } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/zrx-eth-service/zrx-eth.service';

@Injectable()
export class InstantTradeProvidersService {
  public readonly providers: Partial<
    Record<BlockchainName, Partial<Record<INSTANT_TRADE_PROVIDER, ItProvider>>>
  >;

  constructor(
    // Ethereum.
    private readonly oneInchEthService: OneInchEthService,
    private readonly uniswapV2Service: UniSwapV2Service,
    private readonly uniswapV3EthereumService: UniSwapV3EthereumService,
    private readonly sushiSwapEthService: SushiSwapEthService,
    private readonly zrxEthService: ZrxEthService,
    // BSC.
    private readonly pancakeSwapService: PancakeSwapService,
    private readonly oneInchBscService: OneInchBscService,
    private readonly sushiSwapBscService: SushiSwapBscService,
    // Polygon.
    private readonly uniswapV3PolygonService: UniSwapV3PolygonService,
    private readonly oneInchPolygonService: OneInchPolygonService,
    private readonly quickSwapService: QuickSwapService,
    private readonly sushiSwapPolygonService: SushiSwapPolygonService,
    private readonly algebraService: AlgebraService,
    // Harmony.
    private readonly sushiSwapHarmonyService: SushiSwapHarmonyService,
    private readonly viperSwapHarmonyService: ViperSwapHarmonyService,
    // Avalanche.
    private readonly sushiSwapAvalancheService: SushiSwapAvalancheService,
    private readonly pangolinAvalancheService: PangolinAvalancheService,
    private readonly joeAvalancheService: JoeAvalancheService,
    // Fantom.
    private readonly sushiSwapFantomService: SushiSwapFantomService,
    private readonly spookySwapFantomService: SpookySwapFantomService,
    private readonly spiritSwapFantomService: SpiritSwapFantomService,
    // MoonRiver.
    private readonly sushiSwapMoonRiverService: SushiSwapMoonRiverService,
    private readonly solarBeamMoonriverService: SolarBeamMoonRiverService,
    // Arbitrum.
    private readonly sushiSwapArbitrumService: SushiSwapArbitrumService,
    private readonly oneInchArbitrumService: OneInchArbitrumService,
    private readonly uniSwapV3ArbitrumService: UniSwapV3ArbitrumService,
    // Aurora.
    private readonly trisolarisAuroraService: TrisolarisAuroraService,
    private readonly wannaSwapAuroraService: WannaSwapAuroraService,
    // Solana.
    private readonly raydiumService: RaydiumService,
    // Near.
    private readonly refFinanceService: RefFinanceService
  ) {
    this.providers = {
      [BLOCKCHAIN_NAME.ETHEREUM]: {
        [INSTANT_TRADE_PROVIDER.ONEINCH]: this.oneInchEthService,
        [INSTANT_TRADE_PROVIDER.UNISWAP_V2]: this.uniswapV2Service,
        [INSTANT_TRADE_PROVIDER.UNISWAP_V3]: this.uniswapV3EthereumService,
        [INSTANT_TRADE_PROVIDER.SUSHISWAP]: this.sushiSwapEthService,
        [INSTANT_TRADE_PROVIDER.ZRX]: this.zrxEthService
      },
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        [INSTANT_TRADE_PROVIDER.ONEINCH]: this.oneInchBscService,
        [INSTANT_TRADE_PROVIDER.PANCAKESWAP]: this.pancakeSwapService,
        [INSTANT_TRADE_PROVIDER.SUSHISWAP]: this.sushiSwapBscService
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        [INSTANT_TRADE_PROVIDER.ONEINCH]: this.oneInchPolygonService,
        [INSTANT_TRADE_PROVIDER.QUICKSWAP]: this.quickSwapService,
        [INSTANT_TRADE_PROVIDER.SUSHISWAP]: this.sushiSwapPolygonService,
        [INSTANT_TRADE_PROVIDER.ALGEBRA]: this.algebraService,
        [INSTANT_TRADE_PROVIDER.UNISWAP_V3]: this.uniswapV3PolygonService
      },
      [BLOCKCHAIN_NAME.HARMONY]: {
        [INSTANT_TRADE_PROVIDER.SUSHISWAP]: this.sushiSwapHarmonyService,
        [INSTANT_TRADE_PROVIDER.VIPER]: this.viperSwapHarmonyService
      },
      [BLOCKCHAIN_NAME.AVALANCHE]: {
        [INSTANT_TRADE_PROVIDER.SUSHISWAP]: this.sushiSwapAvalancheService,
        [INSTANT_TRADE_PROVIDER.PANGOLIN]: this.pangolinAvalancheService,
        [INSTANT_TRADE_PROVIDER.JOE]: this.joeAvalancheService
      },
      [BLOCKCHAIN_NAME.MOONRIVER]: {
        [INSTANT_TRADE_PROVIDER.SUSHISWAP]: this.sushiSwapMoonRiverService,
        [INSTANT_TRADE_PROVIDER.SOLARBEAM]: this.solarBeamMoonriverService
      },
      [BLOCKCHAIN_NAME.FANTOM]: {
        [INSTANT_TRADE_PROVIDER.SUSHISWAP]: this.sushiSwapFantomService,
        [INSTANT_TRADE_PROVIDER.SPOOKYSWAP]: this.spookySwapFantomService,
        [INSTANT_TRADE_PROVIDER.SPIRITSWAP]: this.spiritSwapFantomService
      },
      [BLOCKCHAIN_NAME.ARBITRUM]: {
        [INSTANT_TRADE_PROVIDER.ONEINCH]: this.oneInchArbitrumService,
        [INSTANT_TRADE_PROVIDER.SUSHISWAP]: this.sushiSwapArbitrumService,
        [INSTANT_TRADE_PROVIDER.UNISWAP_V3]: this.uniSwapV3ArbitrumService
      },
      [BLOCKCHAIN_NAME.AURORA]: {
        [INSTANT_TRADE_PROVIDER.TRISOLARIS]: this.trisolarisAuroraService,
        [INSTANT_TRADE_PROVIDER.WANNASWAP]: this.wannaSwapAuroraService
      },
      [BLOCKCHAIN_NAME.SOLANA]: {
        [INSTANT_TRADE_PROVIDER.RAYDIUM]: this.raydiumService
      },
      [BLOCKCHAIN_NAME.NEAR]: {
        [INSTANT_TRADE_PROVIDER.REF]: this.refFinanceService
      }
    };
  }
}
