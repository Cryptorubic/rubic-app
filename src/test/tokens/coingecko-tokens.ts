import { ETH, WEENUS, WSATT, XEENUS, YEENUS } from './eth-tokens';
import { BLOCKCHAIN_NAME } from '../../app/shared/models/blockchain/BLOCKCHAIN_NAME';
import SwapToken from '../../app/shared/models/tokens/SwapToken';
import { TOKEN_RANK } from '../../app/shared/models/tokens/token-rank';

const eth: SwapToken = {
  name: 'Ethereum',
  symbol: ETH.symbol,
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: ETH.address,
  decimals: ETH.decimals,
  image: 'https://devswaps.mywish.io/media/token_images/cg_logo_eth_ethereum_uibu3ky.png',
  rank: TOKEN_RANK.HIGH,
  price: 1705
};

const weenus = {
  name: 'Weenus',
  symbol: WEENUS.symbol,
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: WEENUS.address,
  decimals: WEENUS.decimals,
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  rank: TOKEN_RANK.LOW,
  price: 10
};

const yeenus = {
  name: 'Yeenus',
  symbol: YEENUS.symbol,
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: YEENUS.address,
  decimals: YEENUS.decimals,
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  rank: TOKEN_RANK.LOW,
  price: 50
};

const xeenus = {
  name: 'Xeenus',
  symbol: XEENUS.symbol,
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: XEENUS.address,
  decimals: XEENUS.decimals,
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  rank: TOKEN_RANK.LOW,
  price: 2
};

const wsatt = {
  name: 'Wsatt',
  symbol: WSATT.symbol,
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: WSATT.address,
  decimals: WSATT.decimals,
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  rank: TOKEN_RANK.LOW,
  price: 5
};

export const coingeckoTestTokens = [eth, weenus, yeenus, xeenus, wsatt];
