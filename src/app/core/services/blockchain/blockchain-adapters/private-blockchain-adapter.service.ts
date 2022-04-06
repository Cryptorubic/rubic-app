import { Injectable } from '@angular/core';
import {
  BLOCKCHAIN_NAME,
  ETH_LIKE_BLOCKCHAIN_NAMES
} from '@shared/models/blockchain/blockchain-name';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { NearWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/near/near-web3-private.service';

@Injectable({
  providedIn: 'root'
})
export class PrivateBlockchainAdapterService {
  public readonly [BLOCKCHAIN_NAME.ETHEREUM]: EthLikeWeb3PrivateService;

  public readonly [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: EthLikeWeb3PrivateService;

  public readonly [BLOCKCHAIN_NAME.POLYGON]: EthLikeWeb3PrivateService;

  public readonly [BLOCKCHAIN_NAME.HARMONY]: EthLikeWeb3PrivateService;

  public readonly [BLOCKCHAIN_NAME.AVALANCHE]: EthLikeWeb3PrivateService;

  public readonly [BLOCKCHAIN_NAME.MOONRIVER]: EthLikeWeb3PrivateService;

  public readonly [BLOCKCHAIN_NAME.FANTOM]: EthLikeWeb3PrivateService;

  public readonly [BLOCKCHAIN_NAME.ARBITRUM]: EthLikeWeb3PrivateService;

  public readonly [BLOCKCHAIN_NAME.AURORA]: EthLikeWeb3PrivateService;

  public readonly [BLOCKCHAIN_NAME.SOLANA]: SolanaWeb3PrivateService;

  public readonly [BLOCKCHAIN_NAME.NEAR]: NearWeb3PrivateService;

  constructor(
    private readonly ethLikeWeb3PrivateService: EthLikeWeb3PrivateService,
    private readonly solanaWeb3PrivateService: SolanaWeb3PrivateService,
    private readonly nearWeb3privateService: NearWeb3PrivateService
  ) {
    ETH_LIKE_BLOCKCHAIN_NAMES.forEach(blockchain => {
      // @ts-ignore. Cannot assign to readonly property in cycle.
      this[blockchain] = ethLikeWeb3PrivateService;
    });
    this[BLOCKCHAIN_NAME.SOLANA] = solanaWeb3PrivateService;
    this[BLOCKCHAIN_NAME.NEAR] = nearWeb3privateService;
  }
}
