import { TuiDialogContext } from '@taiga-ui/core';

export type ProgressTrxNotificationContextInput = {
  withRecentTrades?: boolean;
};

export type ProgressTrxNotificationContext = TuiDialogContext<
  void,
  ProgressTrxNotificationContextInput | undefined
>;
