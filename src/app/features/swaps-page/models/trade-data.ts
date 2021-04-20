import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';

type InstantTradesDataTokens = {
  [tokenPart in TokenPart]: InstantTradesTradeData;
};

export enum INTSTANT_TRADES_TRADE_STATUS {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  CANCELLED = 'Cancelled',
  DONE = 'Done'
}

export interface InstantTradesTradeData {
  memo: string;
  contractAddress: string;
  uniqueLink: string;
  owner: string;

  token: InstantTradesDataTokens;
  blockchain: BLOCKCHAIN_NAME;
  status: INTSTANT_TRADES_TRADE_STATUS;

  expirationDate: moment.Moment;
  isPublic: boolean;
  isWithBrokerFee: boolean;
  brokerAddress: string;
}
