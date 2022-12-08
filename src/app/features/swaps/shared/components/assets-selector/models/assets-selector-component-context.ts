import { TuiDialogContext } from '@taiga-ui/core';
import { Asset } from '@features/swaps/shared/models/form/asset';

export type AssetsSelectorComponentInput = {
  idPrefix: string;
  formType: 'from' | 'to';
};

export type AssetsSelectorComponentContext = TuiDialogContext<Asset, AssetsSelectorComponentInput>;
