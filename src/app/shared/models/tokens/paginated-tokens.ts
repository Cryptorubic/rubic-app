import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface CountPage {
  count: number | undefined;
  page: number;
  maxPage: number;
}

export interface TokensNetworkState {
  [BLOCKCHAIN_NAME.ETHEREUM]: CountPage;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: CountPage;
  [BLOCKCHAIN_NAME.POLYGON]: CountPage;
  [BLOCKCHAIN_NAME.HARMONY]: CountPage;
  [BLOCKCHAIN_NAME.FANTOM]: CountPage;
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: CountPage;
}

export type PAGINATED_BLOCKCHAIN_NAME = Exclude<
  BLOCKCHAIN_NAME,
  | BLOCKCHAIN_NAME.TRON
  | BLOCKCHAIN_NAME.XDAI
  | BLOCKCHAIN_NAME.HARMONY_TESTNET
  | BLOCKCHAIN_NAME.POLYGON_TESTNET
  | BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET
>;
