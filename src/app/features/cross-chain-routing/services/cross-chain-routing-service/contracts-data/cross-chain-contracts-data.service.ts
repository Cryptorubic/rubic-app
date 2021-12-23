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
import { CrossChainContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/cross-chain-contract-data';
import { EthLikeCrossChainContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/eth-like-contract-data';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { SolanaCrossChainContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/solana-contract-data';

@Injectable({
  providedIn: 'root'
})
export class CrossChainContractsDataService {
  constructor(
    private readonly uniSwapV2Service: UniSwapV2Service,
    private readonly pancakeSwapService: PancakeSwapService,
    private readonly quickSwapService: QuickSwapService,
    private readonly pangolinAvalancheService: PangolinAvalancheService,
    private readonly joeAvalancheService: JoeAvalancheService,
    private readonly solarBeamMoonRiverService: SolarBeamMoonRiverService,
    private readonly spookySwapFantomService: SpookySwapFantomService,
    private readonly raydiumService: RaydiumService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService
  ) {}

  public getCrossChainContracts(): Record<SupportedCrossChainBlockchain, CrossChainContractData> {
    return {
      [BLOCKCHAIN_NAME.ETHEREUM]: new EthLikeCrossChainContractData(
        BLOCKCHAIN_NAME.ETHEREUM,
        [
          {
            provider: this.uniSwapV2Service,
            methodSuffix: ''
          }
        ],
        2,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new EthLikeCrossChainContractData(
        BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        [
          {
            provider: this.pancakeSwapService,
            methodSuffix: ''
          }
        ],
        1,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.POLYGON]: new EthLikeCrossChainContractData(
        BLOCKCHAIN_NAME.POLYGON,
        [
          {
            provider: this.quickSwapService,
            methodSuffix: ''
          }
        ],
        3,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.AVALANCHE]: new EthLikeCrossChainContractData(
        BLOCKCHAIN_NAME.AVALANCHE,
        [
          {
            provider: this.pangolinAvalancheService,
            methodSuffix: ''
          },
          {
            provider: this.joeAvalancheService,
            methodSuffix: '1'
          }
        ],
        4,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.MOONRIVER]: new EthLikeCrossChainContractData(
        BLOCKCHAIN_NAME.MOONRIVER,
        [
          {
            provider: this.solarBeamMoonRiverService,
            methodSuffix: ''
          }
        ],
        5,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.FANTOM]: new EthLikeCrossChainContractData(
        BLOCKCHAIN_NAME.FANTOM,
        [
          {
            provider: this.spookySwapFantomService,
            methodSuffix: ''
          }
        ],
        6,
        this.publicBlockchainAdapterService
      ),
      [BLOCKCHAIN_NAME.SOLANA]: new SolanaCrossChainContractData(
        BLOCKCHAIN_NAME.SOLANA,
        [
          {
            provider: this.raydiumService,
            methodSuffix: ''
          }
        ],
        7,
        this.publicBlockchainAdapterService
      )
    };
  }
}
