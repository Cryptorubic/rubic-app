import { PromotionTableColumn } from '@features/promotion/models/table-column.type';

export const promotionTableTranslations: Record<PromotionTableColumn, string> = {
  projectName: 'promotionPage.invitations.tableColumns.projectName',
  invitationDate: 'promotionPage.invitations.tableColumns.invitationDate',
  tradingVolume: 'promotionPage.invitations.tableColumns.tradingVolume',
  received: 'promotionPage.invitations.tableColumns.received',
  receivedTokens: 'promotionPage.invitations.tableColumns.receivedTokens'
};
