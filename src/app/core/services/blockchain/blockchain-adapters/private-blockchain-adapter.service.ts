import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from '@core/services/use-testing-mode/use-testing-mode.service';
import { Web3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/web3-private.service';
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
  public readonly [BLOCKCHAIN_NAME.ETHEREUM]: Web3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: Web3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.POLYGON]: Web3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.HARMONY]: Web3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.AVALANCHE]: Web3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.MOONRIVER]: Web3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.FANTOM]: Web3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.XDAI]: Web3PrivateService = null;

  public readonly [BLOCKCHAIN_NAME.SOLANA]: SolanaWeb3PrivateService = null;

  constructor(
    private useTestingModeService: UseTestingModeService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly solanaWeb3PrivateService: SolanaWeb3PrivateService
  ) {
    WEB3_SUPPORTED_BLOCKCHAINS.forEach(blockchain => {
      // @ts-ignore. Cant assign to readonly property in cycle.
      this[blockchain] = web3PrivateService;
    });
    this[BLOCKCHAIN_NAME.SOLANA] = solanaWeb3PrivateService;
  }
}
