import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'rubic-sdk';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';

type Token = Omit<BlockchainToken, 'blockchain'> & { blockchain: EvmBlockchainName };

export const newRubicToken: Token = {
  decimals: 18,
  symbol: 'RBC',
  name: 'Rubic Token',
  address: '0x780914dB0Ebe3c147C27F170b86D6D644cDD3f7A',
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
};
