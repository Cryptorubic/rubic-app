import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from '@core/services/use-testing-mode/use-testing-mode.service';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';

export const WEB3_SUPPORTED_BLOCKCHAINS = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.AVALANCHE,
  BLOCKCHAIN_NAME.MOONRIVER,
  BLOCKCHAIN_NAME.FANTOM
] as const;

export type Web3SupportedBlockchains = typeof WEB3_SUPPORTED_BLOCKCHAINS[number];

@Injectable({
  providedIn: 'root'
})
export class PrivateBlockchainAdapterService {
  public readonly [BLOCKCHAIN_NAME.ETHEREUM]: EthLikeWeb3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: EthLikeWeb3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.POLYGON]: EthLikeWeb3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.HARMONY]: EthLikeWeb3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.AVALANCHE]: EthLikeWeb3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.MOONRIVER]: EthLikeWeb3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.FANTOM]: EthLikeWeb3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.XDAI]: EthLikeWeb3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.SOLANA]: SolanaWeb3PrivateService = null;

  constructor(
    private useTestingModeService: UseTestingModeService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly solanaWeb3PrivateService: SolanaWeb3PrivateService
  ) {
    WEB3_SUPPORTED_BLOCKCHAINS.forEach(blockchain => {
      // @ts-ignore. Cant assign to readonly property in cycle.
      this[blockchain] = web3PrivateService;
    });
    this[BLOCKCHAIN_NAME.SOLANA] = solanaWeb3PrivateService;
  }
}
