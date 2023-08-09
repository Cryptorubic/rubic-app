import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { Faucet } from '@features/faucets/models/faucet';

export const defaultFaucets: Partial<Record<BlockchainName, Faucet[]>> = {
  [BLOCKCHAIN_NAME.GOERLI]: [
    {
      token: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        icon_url:
          'https://assets.rubic.exchange/assets/goerli/0x0000000000000000000000000000000000000000/logo.png'
      },
      url: 'https://goerlifaucet.com/',
      name: 'Ether'
    }
  ],
  [BLOCKCHAIN_NAME.SCROLL_TESTNET]: [
    {
      token: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        icon_url:
          'https://assets.rubic.exchange/assets/scroll-alpha-testnet/0x0000000000000000000000000000000000000000/logo.png'
      },
      url: 'https://scroll.l2scan.co/faucet',
      name: 'Ether'
    }
  ]
};
