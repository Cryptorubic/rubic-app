import { ContractAddressesNetMode } from '@shared/models/blockchain/NetMode';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { RubicBridgeSupportedBlockchains } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/models/types';

export const rubicBridgeContractAddressesNetMode: ContractAddressesNetMode<RubicBridgeSupportedBlockchains> =
  {
    mainnet: {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x6126E5Dd5720681F444B50a5540168F529646d7d',
      [BLOCKCHAIN_NAME.POLYGON]: '0xF14E9597669d409bCa47B05F2BA3C9d3b4c52cA9'
    },
    testnet: {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xd806e441b27f4f827710469b0acb4e045e62b676',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x17caca02ddf472f62bfed5165facf7a6b5c72926',
      [BLOCKCHAIN_NAME.POLYGON]: '0xF14E9597669d409bCa47B05F2BA3C9d3b4c52cA9' // @TODO TESTNET.
    }
  };

export const rubicTokenAddressesNetMode: ContractAddressesNetMode<RubicBridgeSupportedBlockchains> =
  {
    mainnet: {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x8e3bcc334657560253b83f08331d85267316e08a',
      [BLOCKCHAIN_NAME.POLYGON]: '0xc3cffdaf8f3fdf07da6d5e3a89b8723d5e385ff8'
    },
    testnet: {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xd51bd30a91f88dcf72acd45c8a1e7ae0066263e8',
      [BLOCKCHAIN_NAME.POLYGON]: '0xF14E9597669d409bCa47B05F2BA3C9d3b4c52cA9' // @TODO TESTNET.
    }
  };
