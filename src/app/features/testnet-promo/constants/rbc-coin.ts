import { BlockchainToken } from '@app/shared/models/tokens/blockchain-token';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from '@cryptorubic/core';

type Token = Omit<BlockchainToken, 'blockchain'> & { blockchain: EvmBlockchainName };

export const rbcCoin: Token = {
  decimals: 18,
  symbol: 'RBC',
  name: 'RUBIC TOKEN',
  address: '0x10aaed289a7b1b0155bf4b86c862f297e84465e0',
  blockchain: BLOCKCHAIN_NAME.ARBITRUM
};
