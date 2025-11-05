import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { BridgersCrossChainSupportedBlockchain } from '../../../../cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';

export const bridgersContractAddresses: Record<BridgersCrossChainSupportedBlockchain, string> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: '0xb685760ebd368a891f27ae547391f4e2a289895b',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xb685760ebd368a891f27ae547391f4e2a289895b',
  [BLOCKCHAIN_NAME.POLYGON]: '0xb685760ebd368a891f27ae547391f4e2a289895b',
  [BLOCKCHAIN_NAME.FANTOM]: '0xb685760ebd368a891f27ae547391f4e2a289895b',
  [BLOCKCHAIN_NAME.TRON]: 'TPwezUWpEGmFBENNWJHwXHRG1D2NCEEt5s'
};
