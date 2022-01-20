import { Token } from '@shared/models/tokens/token';

export interface PromotionTableDataItem {
  projectUrl: string;
  invitationDate: Date;
  tradingVolume: number;
  received: number;
  receivedTokens: number;
  token: Token;
}
