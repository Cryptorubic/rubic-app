import { ContractAddressesNetMode } from 'src/app/shared/models/blockchain/NetMode';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

type SupportedBlockchain = BLOCKCHAIN_NAME.ETHEREUM | BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

export const rubicBridgeContractAddressesNetMode: ContractAddressesNetMode<SupportedBlockchain> = {
  mainnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x8E3BCC334657560253B83f08331d85267316e08a',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xE77b0E832A58aFc2fcDaed060E8D701d97533086'
  },
  testnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xd806e441b27f4f827710469b0acb4e045e62b676',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x17caca02ddf472f62bfed5165facf7a6b5c72926'
  }
};

export const rubicTokenAddressesNetMode: ContractAddressesNetMode<SupportedBlockchain> = {
  mainnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xE77b0E832A58aFc2fcDaed060E8D701d97533086'
  },
  testnet: {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x8e3bcc334657560253b83f08331d85267316e08a',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xd51bd30a91f88dcf72acd45c8a1e7ae0066263e8'
  }
};
