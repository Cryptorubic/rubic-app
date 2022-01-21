import { Token } from '@shared/models/tokens/token';

export interface PromotionTableDataItem {
  projectName: string;
  projectUrl: string;
  invitationDate: Date;
  tradingVolume: number;
  received: number;
  receivedTokens: number;
  token: Token;
}

export type PromotionTableData = ReadonlyArray<PromotionTableDataItem>;
