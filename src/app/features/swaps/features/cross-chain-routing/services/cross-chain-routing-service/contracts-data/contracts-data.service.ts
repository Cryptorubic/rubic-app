import { Injectable } from '@angular/core';
import { UniSwapV2Service } from '@features/swaps/core/instant-trade/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { PancakeSwapService } from '@features/swaps/core/instant-trade/providers/bsc/pancake-swap-service/pancake-swap.service';
import { QuickSwapService } from '@features/swaps/core/instant-trade/providers/polygon/quick-swap-service/quick-swap.service';
import { PangolinAvalancheService } from '@features/swaps/core/instant-trade/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche.service';
import { JoeAvalancheService } from '@features/swaps/core/instant-trade/providers/avalanche/joe-avalanche-service/joe-avalanche.service';
import { SolarBeamMoonRiverService } from '@features/swaps/core/instant-trade/providers/moonriver/solarbeam-moonriver/solarbeam-moonriver.service';
import { SpookySwapFantomService } from '@features/swaps/core/instant-trade/providers/fantom/spooky-swap-fantom-service/spooky-swap-fantom.service';
import { RaydiumService } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/raydium.service';
import { SupportedCrossChainBlockchain } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { EthLikeContractData } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/eth-like-contract-data';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { SushiSwapHarmonyService } from '@features/swaps/core/instant-trade/providers/harmony/sushi-swap-harmony/sushi-swap-harmony.service';
import { SpiritSwapFantomService } from '@features/swaps/core/instant-trade/providers/fantom/spirit-swap-fantom-service/spirit-swap-fantom.service';
import { ViperSwapHarmonyService } from '@features/swaps/core/instant-trade/providers/harmony/viper-swap-harmony/viper-swap-harmony.service';
import { SushiSwapEthService } from '@features/swaps/core/instant-trade/providers/ethereum/sushi-swap-eth-service/sushi-swap-eth.service';
import { SushiSwapBscService } from '@features/swaps/core/instant-trade/providers/bsc/sushi-swap-bsc-service/sushi-swap-bsc.service';
import { SushiSwapPolygonService } from '@features/swaps/core/instant-trade/providers/polygon/sushi-swap-polygon-service/sushi-swap-polygon.service';
import { SushiSwapAvalancheService } from '@features/swaps/core/instant-trade/providers/avalanche/sushi-swap-avalanche-service/sushi-swap-avalanche.service';
import { SushiSwapMoonRiverService } from '@features/swaps/core/instant-trade/providers/moonriver/sushi-swap-moonriver/sushi-swap-moonriver.service';
import { SushiSwapFantomService } from '@features/swaps/core/instant-trade/providers/fantom/sushi-swap-fantom-service/sushi-swap-fantom-service.service';
import {
  BLOCKCHAIN_NAME,
  EthLikeBlockchainName,
  NearBlockchainName,
  SolanaBlockchainName
} from '@shared/models/blockchain/blockchain-name';
import { SolanaContractData } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/solana-contract-data';
import { OneInchPolygonService } from '@features/swaps/core/instant-trade/providers/polygon/one-inch-polygon-service/one-inch-polygon.service';
import { OneInchEthService } from '@features/swaps/core/instant-trade/providers/ethereum/one-inch-eth-service/one-inch-eth.service';
import { OneInchBscService } from '@features/swaps/core/instant-trade/providers/bsc/one-inch-bsc-service/one-inch-bsc.service';
import { OneInchFantomService } from '@app/features/swaps/core/instant-trade/providers/fantom/one-inch-fantom-service/one-inch-fantom.service';
import { OneInchAvalancheService } from '@app/features/swaps/core/instant-trade/providers/avalanche/one-inch-avalanche-service/one-inch-avalanche.service';
import { AlgebraService } from '@features/swaps/core/instant-trade/providers/polygon/algebra-service/algebra.service';
import { UniSwapV3PolygonService } from '@features/swaps/core/instant-trade/providers/polygon/uni-swap-v3-polygon-service/uni-swap-v3-polygon.service';
import { UniSwapV3EthereumService } from '@features/swaps/core/instant-trade/providers/ethereum/uni-swap-v3-ethereum-service/uni-swap-v3-ethereum.service';
import { SushiSwapArbitrumService } from '@features/swaps/core/instant-trade/providers/arbitrum/sushi-swap-arbitrum-service/sushi-swap-arbitrum.service';
import { UniSwapV3ArbitrumService } from '@features/swaps/core/instant-trade/providers/arbitrum/uni-swap-v3-arbitrum-service/uni-swap-v3-arbitrum.service';
import { OneInchArbitrumService } from '@features/swaps/core/instant-trade/providers/arbitrum/one-inch-arbitrum-service/one-inch-arbitrum.service';
import { TrisolarisAuroraService } from '@features/swaps/core/instant-trade/providers/aurora/trisolaris-aurora-service/trisolaris-aurora.service';
import { WannaSwapAuroraService } from '@features/swaps/core/instant-trade/providers/aurora/wanna-swap-aurora-service/wanna-swap-aurora.service';
import { NearContractData } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/near-contract-data';
import { RefFinanceService } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/ref-finance.service';
import { SushiSwapTelosService } from '@features/swaps/core/instant-trade/providers/telos/sushi-swap-telos-service/sushi-swap-telos.service';
import { ZappyService } from '@features/swaps/core/instant-trade/providers/telos/zappy-service/zappy.service';

@Injectable()
export class ContractsDataService {
  public readonly contracts: Record<
    SupportedCrossChainBlockchain & EthLikeBlockchainName,
    EthLikeContractData
  > &
    Record<SupportedCrossChainBlockchain & SolanaBlockchainName, SolanaContractData> &
    Record<SupportedCrossChainBlockchain & NearBlockchainName, NearContractData>;

  constructor(
    // providers start
    // Ethereum.
    private readonly uniSwapV2Service: UniSwapV2Service,
    private readonly sushiSwapEthService: SushiSwapEthService,
    private readonly uniSwapV3EthereumService: UniSwapV3EthereumService,
    private readonly oneInchEthService: OneInchEthService,
    // BSC.
    private readonly pancakeSwapService: PancakeSwapService,
    private readonly sushiSwapBscService: SushiSwapBscService,
    private readonly oneInchBscService: OneInchBscService,
    // Polygon.
    private readonly quickSwapService: QuickSwapService,
    private readonly sushiSwapPolygonService: SushiSwapPolygonService,
    private readonly algebraService: AlgebraService,
    private readonly uniSwapV3PolygonService: UniSwapV3PolygonService,
    private readonly oneInchPolygonService: OneInchPolygonService,
    // Avalanche.
    private readonly pangolinAvalancheService: PangolinAvalancheService,
    private readonly joeAvalancheService: JoeAvalancheService,
    private readonly sushiSwapAvalancheService: SushiSwapAvalancheService,
    private readonly oneInchAvalancheService: OneInchAvalancheService,
    // Fantom.
    private readonly spookySwapFantomService: SpookySwapFantomService,
    private readonly spiritSwapFantomService: SpiritSwapFantomService,
    private readonly sushiSwapFantomService: SushiSwapFantomService,
    private readonly oneInchFantomService: OneInchFantomService,
    // Moonriver.
    private readonly solarBeamMoonRiverService: SolarBeamMoonRiverService,
    private readonly sushiSwapMoonRiverService: SushiSwapMoonRiverService,
    // Harmony.
    private readonly sushiSwapHarmonyService: SushiSwapHarmonyService,
    private readonly viperSwapHarmonyService: ViperSwapHarmonyService,
    // Arbitrum.
    private readonly sushiSwapArbitrumService: SushiSwapArbitrumService,
    private readonly uniSwapV3ArbitrumService: UniSwapV3ArbitrumService,
    private readonly oneInchArbitrumService: OneInchArbitrumService,
    // Aurora.
    private readonly trisolarisAuroraService: TrisolarisAuroraService,
    private readonly wannaSwapAuroraService: WannaSwapAuroraService,
    // Solana.
    private readonly raydiumService: RaydiumService,
    // Near.
    private readonly refFinanceService: RefFinanceService,
    // Telos.
    private readonly sushiSwapTelosService: SushiSwapTelosService,
    private readonly zappyService: ZappyService,
    // providers end
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService
  ) {
    this.contracts = {
      [BLOCKCHAIN_NAME.ETHEREUM]: new EthLikeContractData(
        BLOCKCHAIN_NAME.ETHEREUM,
        [
          {
            provider: this.uniSwapV2Service,
            methodSuffix: ''
          },
          {
            provider: this.sushiSwapEthService,
            methodSuffix: '1'
          },
          {
            provider: this.uniSwapV3EthereumService,
            methodSuffix: 'V3'
          },
          {
            provider: this.oneInchEthService,
            methodSuffix: 'Inch'
          }
        ],
        2,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new EthLikeContractData(
        BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        [
          {
            provider: this.pancakeSwapService,
            methodSuffix: ''
          },
          {
            provider: this.sushiSwapBscService,
            methodSuffix: '1'
          },
          {
            provider: this.oneInchBscService,
            methodSuffix: 'Inch'
          }
        ],
        1,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.POLYGON]: new EthLikeContractData(
        BLOCKCHAIN_NAME.POLYGON,
        [
          {
            provider: this.quickSwapService,
            methodSuffix: ''
          },
          {
            provider: this.sushiSwapPolygonService,
            methodSuffix: '1'
          },
          {
            provider: this.algebraService,
            methodSuffix: 'ALGB'
          },
          {
            provider: this.uniSwapV3PolygonService,
            methodSuffix: 'V3'
          },
          {
            provider: this.oneInchPolygonService,
            methodSuffix: 'Inch'
          }
        ],
        3,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.AVALANCHE]: new EthLikeContractData(
        BLOCKCHAIN_NAME.AVALANCHE,
        [
          {
            provider: this.pangolinAvalancheService,
            methodSuffix: 'AVAX'
          },
          {
            provider: this.joeAvalancheService,
            methodSuffix: 'AVAX1'
          },
          {
            provider: this.sushiSwapAvalancheService,
            methodSuffix: ''
          },
          {
            provider: this.oneInchAvalancheService,
            methodSuffix: 'Inch'
          }
        ],
        4,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.FANTOM]: new EthLikeContractData(
        BLOCKCHAIN_NAME.FANTOM,
        [
          {
            provider: this.spookySwapFantomService,
            methodSuffix: ''
          },
          {
            provider: this.spiritSwapFantomService,
            methodSuffix: '1'
          },
          {
            provider: this.sushiSwapFantomService,
            methodSuffix: '2'
          },
          {
            provider: this.oneInchFantomService,
            methodSuffix: 'Inch'
          }
        ],
        5,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.MOONRIVER]: new EthLikeContractData(
        BLOCKCHAIN_NAME.MOONRIVER,
        [
          {
            provider: this.solarBeamMoonRiverService,
            methodSuffix: ''
          },
          {
            provider: this.sushiSwapMoonRiverService,
            methodSuffix: '1'
          }
        ],
        6,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.HARMONY]: new EthLikeContractData(
        BLOCKCHAIN_NAME.HARMONY,
        [
          {
            provider: this.sushiSwapHarmonyService,
            methodSuffix: ''
          },
          {
            provider: this.viperSwapHarmonyService,
            methodSuffix: '1'
          }
        ],
        7,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.ARBITRUM]: new EthLikeContractData(
        BLOCKCHAIN_NAME.ARBITRUM,
        [
          {
            provider: this.sushiSwapArbitrumService,
            methodSuffix: ''
          },
          {
            provider: this.uniSwapV3ArbitrumService,
            methodSuffix: 'V3'
          },
          {
            provider: this.oneInchArbitrumService,
            methodSuffix: 'Inch'
          }
        ],
        10,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.AURORA]: new EthLikeContractData(
        BLOCKCHAIN_NAME.AURORA,
        [
          {
            provider: this.trisolarisAuroraService,
            methodSuffix: ''
          },
          {
            provider: this.wannaSwapAuroraService,
            methodSuffix: '1'
          }
        ],
        11,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.SOLANA]: new SolanaContractData(
        [
          {
            provider: this.raydiumService,
            methodSuffix: ''
          }
        ],
        8,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.NEAR]: new NearContractData(
        [
          {
            provider: this.refFinanceService,
            methodSuffix: ''
          }
        ],
        9,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.TELOS]: new EthLikeContractData(
        BLOCKCHAIN_NAME.TELOS,
        [
          {
            provider: this.sushiSwapTelosService,
            methodSuffix: ''
          },
          {
            provider: this.zappyService,
            methodSuffix: '1'
          }
        ],
        12,
        this.publicBlockchainAdapterService
      )
    };
  }
}
