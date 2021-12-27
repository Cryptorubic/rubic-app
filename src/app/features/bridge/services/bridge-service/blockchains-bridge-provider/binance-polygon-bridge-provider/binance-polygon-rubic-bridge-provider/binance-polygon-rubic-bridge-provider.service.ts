import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { CommonRubicBridgeProvider } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/common-rubic-bridge-provider';
import { RubicBridgeConfig } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/models/types';

@Injectable()
export class BinancePolygonRubicBridgeProviderService extends CommonRubicBridgeProvider {
  constructor() {
    const config: RubicBridgeConfig = {
      from: {
        maxAmount: 100_000,
        blockchainName: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        token: {
          symbol: 'BRBC',
          name: 'Rubic',
          decimals: 18
        }
      },
      to: {
        maxAmount: 100_000,
        blockchainName: BLOCKCHAIN_NAME.POLYGON,
        token: {
          symbol: 'RBC',
          name: 'Rubic (PoS)',
          decimals: 18
        }
      }
    };
    super(config);
  }
}
