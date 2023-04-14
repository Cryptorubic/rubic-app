import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'rubic-sdk';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';

type Token = Omit<BlockchainToken, 'blockchain'> & { blockchain: EvmBlockchainName };

export const newRubicToken: Token = {
  decimals: 18,
  symbol: 'MintTKN',
  name: 'Mintable Token',
  address: '0xa1a139e9cb5fde073235407d3d8f69e8d7b1b20f',
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
};
