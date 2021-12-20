import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CommonRubicBridgeProvider } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/common-rubic-bridge-provider';
import { RubicBridgeSupportedBlockchains } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/constants/addresses-net-mode';

export interface RubicBridgeConfig {
  maxAmountEth: number;
  maxAmountNonEth: number;
  blockchainName: RubicBridgeSupportedBlockchains;
  apiBlockchainName: string;
  nonEthToken: {
    symbol: string;
    name: string;
    decimals: number;
  };
}

@Injectable()
export class EthereumBinanceRubicBridgeProviderService extends CommonRubicBridgeProvider {
  constructor() {
    const config: RubicBridgeConfig = {
      maxAmountEth: 50_000,
      maxAmountNonEth: 50_000,
      blockchainName: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      apiBlockchainName: 'Binance-Smart-Chain',
      nonEthToken: {
        symbol: 'BRBC',
        name: 'Rubic',
        decimals: 18
      }
    };
    super(config);
  }
}
