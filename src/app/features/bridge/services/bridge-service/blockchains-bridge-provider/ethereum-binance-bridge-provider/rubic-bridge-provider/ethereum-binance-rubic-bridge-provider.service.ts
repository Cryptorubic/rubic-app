import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { CommonRubicBridgeProvider } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/common-rubic-bridge-provider';
import { RubicBridgeConfig } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/models/types';

@Injectable()
export class EthereumBinanceRubicBridgeProviderService extends CommonRubicBridgeProvider {
  constructor() {
    const config: RubicBridgeConfig = {
      from: {
        maxAmount: 100_000,
        blockchainName: BLOCKCHAIN_NAME.ETHEREUM,
        token: {
          symbol: 'RBC',
          name: 'Rubic',
          decimals: 18
        }
      },
      to: {
        maxAmount: 100_000,
        blockchainName: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        token: {
          symbol: 'BRBC',
          name: 'Rubic',
          decimals: 18
        }
      }
    };
    super(config);
  }
}
