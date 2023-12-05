import { TuiDialogContext } from '@taiga-ui/core';
import { Asset } from '@features/trade/models/asset';

export type AssetsSelectorComponentInput = {
  idPrefix: string;
  formType: 'from' | 'to';
};

export type AssetsSelectorComponentContext = TuiDialogContext<Asset, AssetsSelectorComponentInput>;
