import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME, BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { OneInchEthService } from '@features/swaps/core/instant-trade/providers/ethereum/one-inch-eth-service/one-inch-eth.service';
import { UniSwapV2Service } from '@features/swaps/core/instant-trade/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { OneInchPolygonService } from '@features/swaps/core/instant-trade/providers/polygon/one-inch-polygon-service/one-inch-polygon.service';
import { QuickSwapService } from '@features/swaps/core/instant-trade/providers/polygon/quick-swap-service/quick-swap.service';
import { PancakeSwapService } from '@features/swaps/core/instant-trade/providers/bsc/pancake-swap-service/pancake-swap.service';
import { OneInchBscService } from '@features/swaps/core/instant-trade/providers/bsc/one-inch-bsc-service/one-inch-bsc.service';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { SushiSwapPolygonService } from '@features/swaps/core/instant-trade/providers/polygon/sushi-swap-polygon-service/sushi-swap-polygon.service';
import { SushiSwapEthService } from '@features/swaps/core/instant-trade/providers/ethereum/sushi-swap-eth-service/sushi-swap-eth.service';
import { SushiSwapBscService } from '@features/swaps/core/instant-trade/providers/bsc/sushi-swap-bsc-service/sushi-swap-bsc.service';
import { SushiSwapHarmonyService } from '@features/swaps/core/instant-trade/providers/harmony/sushi-swap-harmony/sushi-swap-harmony.service';
import { UniSwapV3EthereumService } from '@features/swaps/core/instant-trade/providers/ethereum/uni-swap-v3-ethereum-service/uni-swap-v3-ethereum.service';
import { SolarBeamMoonRiverService } from '@features/swaps/core/instant-trade/providers/moonriver/solarbeam-moonriver/solarbeam-moonriver.service';
import { SushiSwapMoonRiverService } from '@features/swaps/core/instant-trade/providers/moonriver/sushi-swap-moonriver/sushi-swap-moonriver.service';
import { SushiSwapAvalancheService } from '@features/swaps/core/instant-trade/providers/avalanche/sushi-swap-avalanche-service/sushi-swap-avalanche.service';
import { PangolinAvalancheService } from '@features/swaps/core/instant-trade/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche.service';
import { JoeAvalancheService } from '@features/swaps/core/instant-trade/providers/avalanche/joe-avalanche-service/joe-avalanche.service';
import { SushiSwapFantomService } from '@features/swaps/core/instant-trade/providers/fantom/sushi-swap-fantom-service/sushi-swap-fantom-service.service';
import { SpookySwapFantomService } from '@features/swaps/core/instant-trade/providers/fantom/spooky-swap-fantom-service/spooky-swap-fantom.service';
import { SpiritSwapFantomService } from '@features/swaps/core/instant-trade/providers/fantom/spirit-swap-fantom-service/spirit-swap-fantom.service';
import { RaydiumService } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/raydium.service';
import { AlgebraService } from '@features/swaps/core/instant-trade/providers/polygon/algebra-service/algebra.service';
import { ViperSwapHarmonyService } from '@features/swaps/core/instant-trade/providers/harmony/viper-swap-harmony/viper-swap-harmony.service';
import { UniSwapV3PolygonService } from '@features/swaps/core/instant-trade/providers/polygon/uni-swap-v3-polygon-service/uni-swap-v3-polygon.service';
import { SushiSwapArbitrumService } from '@features/swaps/core/instant-trade/providers/arbitrum/sushi-swap-arbitrum-service/sushi-swap-arbitrum.service';
import { OneInchArbitrumService } from '@features/swaps/core/instant-trade/providers/arbitrum/one-inch-arbitrum-service/one-inch-arbitrum.service';
import { UniSwapV3ArbitrumService } from '@features/swaps/core/instant-trade/providers/arbitrum/uni-swap-v3-arbitrum-service/uni-swap-v3-arbitrum.service';
import { TrisolarisAuroraService } from '@features/swaps/core/instant-trade/providers/aurora/trisolaris-aurora-service/trisolaris-aurora.service';
import { WannaSwapAuroraService } from '@features/swaps/core/instant-trade/providers/aurora/wanna-swap-aurora-service/wanna-swap-aurora.service';
import { RefFinanceService } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/ref-finance.service';
import { ItProvider } from '@features/swaps/core/instant-trade/models/it-provider';
import { ZrxEthService } from '@features/swaps/core/instant-trade/providers/ethereum/zrx-eth-service/zrx-eth.service';
import { SushiSwapTelosService } from '@features/swaps/core/instant-trade/providers/telos/sushi-swap-telos-service/sushi-swap-telos.service';
import { ZappyService } from '@features/swaps/core/instant-trade/providers/telos/zappy-service/zappy.service';

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
    private readonly refFinanceService: RefFinanceService,
    // Telos.
    private readonly sushiSwapTelosService: SushiSwapTelosService,
    private readonly zappyService: ZappyService
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
      },
      [BLOCKCHAIN_NAME.TELOS]: {
        [INSTANT_TRADE_PROVIDER.SUSHISWAP]: this.sushiSwapTelosService,
        [INSTANT_TRADE_PROVIDER.ZAPPY]: this.zappyService
      }
    };
  }
}
