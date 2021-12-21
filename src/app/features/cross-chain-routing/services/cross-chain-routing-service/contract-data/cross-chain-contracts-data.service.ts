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
import { CrossChainContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/cross-chain-contract-data';

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
    private readonly raydiumService: RaydiumService
  ) {}

  public getCrossChainContracts(): Record<SupportedCrossChainBlockchain, CrossChainContractData> {
    return {
      [BLOCKCHAIN_NAME.ETHEREUM]: new CrossChainContractData(
        BLOCKCHAIN_NAME.ETHEREUM,
        [
          {
            provider: this.uniSwapV2Service,
            methodSuffix: ''
          }
        ],
        1
      ),
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new CrossChainContractData(
        BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        [
          {
            provider: this.pancakeSwapService,
            methodSuffix: ''
          }
        ],
        2
      ),
      [BLOCKCHAIN_NAME.POLYGON]: new CrossChainContractData(
        BLOCKCHAIN_NAME.POLYGON,
        [
          {
            provider: this.quickSwapService,
            methodSuffix: ''
          }
        ],
        3
      ),
      [BLOCKCHAIN_NAME.AVALANCHE]: new CrossChainContractData(
        BLOCKCHAIN_NAME.AVALANCHE,
        [
          {
            provider: this.joeAvalancheService,
            methodSuffix: ''
          },
          {
            provider: this.pangolinAvalancheService,
            methodSuffix: '1'
          }
        ],
        4
      ),
      [BLOCKCHAIN_NAME.MOONRIVER]: new CrossChainContractData(
        BLOCKCHAIN_NAME.MOONRIVER,
        [
          {
            provider: this.solarBeamMoonRiverService,
            methodSuffix: ''
          }
        ],
        5
      ),
      [BLOCKCHAIN_NAME.FANTOM]: new CrossChainContractData(
        BLOCKCHAIN_NAME.FANTOM,
        [
          {
            provider: this.spookySwapFantomService,
            methodSuffix: ''
          }
        ],
        6
      ),
      [BLOCKCHAIN_NAME.SOLANA]: new CrossChainContractData(
        BLOCKCHAIN_NAME.SOLANA,
        [
          {
            provider: this.raydiumService,
            methodSuffix: ''
          }
        ],
        7
      )
    };
  }
}
