import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'rubic-sdk';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';

type Token = Omit<BlockchainToken, 'blockchain'> & { blockchain: EvmBlockchainName };

export const newRubicToken: Token = {
  decimals: 18,
  symbol: 'RBC',
  name: 'Rubic Token',
  address: '0x3330BFb7332cA23cd071631837dC289B09C33333',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM
};
