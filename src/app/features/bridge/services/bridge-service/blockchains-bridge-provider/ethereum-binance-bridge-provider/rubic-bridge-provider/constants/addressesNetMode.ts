import { ContractAddressesNetMode } from 'src/app/shared/models/blockchain/NetMode';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

type SupportedBlockchain = BLOCKCHAIN_NAME.ETHEREUM | BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

export const rubicBridgeContractAddressesNetMode: ContractAddressesNetMode<SupportedBlockchain> = {
  mainnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x6126E5Dd5720681F444B50a5540168F529646d7d'
  },
  testnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xd806e441b27f4f827710469b0acb4e045e62b676',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x17caca02ddf472f62bfed5165facf7a6b5c72926'
  }
};

export const rubicTokenAddressesNetMode: ContractAddressesNetMode<SupportedBlockchain> = {
  mainnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x8e3bcc334657560253b83f08331d85267316e08a'
  },
  testnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xd51bd30a91f88dcf72acd45c8a1e7ae0066263e8'
  }
};
