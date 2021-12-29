import { Injectable } from '@angular/core';
import { UniSwapV2Service } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { PancakeSwapService } from '@features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap.service';
import { QuickSwapService } from '@features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap.service';
import { PangolinAvalancheService } from '@features/instant-trade/services/instant-trade-service/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche.service';
import { JoeAvalancheService } from '@features/instant-trade/services/instant-trade-service/providers/avalanche/joe-avalanche-service/joe-avalanche.service';
import { SolarBeamMoonRiverService } from '@features/instant-trade/services/instant-trade-service/providers/moonriver/solarbeam-moonriver/solarbeam-moonriver.service';
import { SpookySwapFantomService } from '@features/instant-trade/services/instant-trade-service/providers/fantom/spooky-swap-fantom-service/spooky-swap-fantom.service';
import { RaydiumService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/raydium.service';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { ContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/contract-data';
import { EthLikeContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/eth-like-contract-data';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { SolanaContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/solana-contract-data';
import { SushiSwapHarmonyService } from '@features/instant-trade/services/instant-trade-service/providers/harmony/sushi-swap-harmony/sushi-swap-harmony.service';
import { SpiritSwapFantomService } from '@features/instant-trade/services/instant-trade-service/providers/fantom/spirit-swap-fantom-service/spirit-swap-fantom.service';
import { ViperSwapHarmonyService } from '@features/instant-trade/services/instant-trade-service/providers/harmony/viper-swap-harmony/viper-swap-harmony.service';
import { SushiSwapEthService } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/sushi-swap-eth-service/sushi-swap-eth.service';
import { SushiSwapBscService } from '@features/instant-trade/services/instant-trade-service/providers/bsc/sushi-swap-bsc-service/sushi-swap-bsc.service';
import { SushiSwapPolygonService } from '@features/instant-trade/services/instant-trade-service/providers/polygon/sushi-swap-polygon-service/sushi-swap-polygon.service';
import { SushiSwapAvalancheService } from '@features/instant-trade/services/instant-trade-service/providers/avalanche/sushi-swap-avalanche-service/sushi-swap-avalanche.service';
import { SushiSwapMoonRiverService } from '@features/instant-trade/services/instant-trade-service/providers/moonriver/sushi-swap-moonriver/sushi-swap-moonriver.service';
import { SushiSwapFantomService } from '@features/instant-trade/services/instant-trade-service/providers/fantom/sushi-swap-fantom-service/sushi-swap-fantom-service.service';

@Injectable({
  providedIn: 'root'
})
export class ContractsDataService {
  public readonly contracts: Readonly<Record<SupportedCrossChainBlockchain, ContractData>>;

  constructor(
    // providers start
    private readonly uniSwapV2Service: UniSwapV2Service,
    private readonly sushiSwapEthService: SushiSwapEthService,

    private readonly pancakeSwapService: PancakeSwapService,
    private readonly sushiSwapBscService: SushiSwapBscService,

    private readonly quickSwapService: QuickSwapService,
    private readonly sushiSwapPolygonService: SushiSwapPolygonService,

    private readonly pangolinAvalancheService: PangolinAvalancheService,
    private readonly joeAvalancheService: JoeAvalancheService,
    private readonly sushiSwapAvalancheService: SushiSwapAvalancheService,

    private readonly solarBeamMoonRiverService: SolarBeamMoonRiverService,
    private readonly sushiSwapMoonRiverService: SushiSwapMoonRiverService,

    private readonly spookySwapFantomService: SpookySwapFantomService,
    private readonly spiritSwapFantomService: SpiritSwapFantomService,
    private readonly sushiSwapFantomService: SushiSwapFantomService,

    private readonly sushiSwapHarmonyService: SushiSwapHarmonyService,
    private readonly viperSwapHarmonyService: ViperSwapHarmonyService,

    private readonly raydiumService: RaydiumService,
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
          }
        ],
        4,
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
        5,
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
            methodSuffix: ''
          }
        ],
        7,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.SOLANA]: new SolanaContractData(
        BLOCKCHAIN_NAME.SOLANA,
        [
          {
            provider: this.raydiumService,
            methodSuffix: ''
          }
        ],
        8,
        this.publicBlockchainAdapterService
      )
    };
  }
}
