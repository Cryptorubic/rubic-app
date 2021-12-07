import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { HttpClient } from '@angular/common/http';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { PrivateAdapterService } from '@core/services/blockchain/web3/web3-private-service/private-adapter.service';
import { SolanaPrivateAdapterService } from '@core/services/blockchain/web3/web3-private-service/solana-private-adapter.service';

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
  public [BLOCKCHAIN_NAME.ETHEREUM]: PrivateAdapterService;

  public [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: PrivateAdapterService;

  public [BLOCKCHAIN_NAME.POLYGON]: PrivateAdapterService;

  public [BLOCKCHAIN_NAME.HARMONY]: PrivateAdapterService;

  public [BLOCKCHAIN_NAME.AVALANCHE]: PrivateAdapterService;

  public [BLOCKCHAIN_NAME.MOONRIVER]: PrivateAdapterService;

  public [BLOCKCHAIN_NAME.FANTOM]: PrivateAdapterService;

  public readonly [BLOCKCHAIN_NAME.XDAI]: PrivateAdapterService = null;

  public readonly [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: PrivateAdapterService = null;

  public readonly [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: PrivateAdapterService = null;

  public readonly [BLOCKCHAIN_NAME.POLYGON_TESTNET]: PrivateAdapterService = null;

  public readonly [BLOCKCHAIN_NAME.HARMONY_TESTNET]: PrivateAdapterService = null;

  public readonly [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: PrivateAdapterService = null;

  public readonly [BLOCKCHAIN_NAME.SOLANA]: SolanaPrivateAdapterService = null;

  constructor(
    private useTestingModeService: UseTestingModeService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpClient: HttpClient,
    private readonly web3PrivateService: PrivateAdapterService,
    private readonly solanaWeb3PrivateService: SolanaPrivateAdapterService
  ) {
    WEB3_SUPPORTED_BLOCKCHAINS.forEach(blockchain => {
      this[blockchain] = web3PrivateService;
    });
    this[BLOCKCHAIN_NAME.SOLANA] = solanaWeb3PrivateService;
  }
}
