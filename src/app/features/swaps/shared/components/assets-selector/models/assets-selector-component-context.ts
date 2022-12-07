import { TuiDialogContext } from '@taiga-ui/core';
import { FromAsset } from '@features/swaps/shared/models/form/asset';

export type AssetsSelectorComponentInput = {
  idPrefix: string;
  formType: 'from' | 'to';
};

export type AssetsSelectorComponentContext = TuiDialogContext<
  FromAsset,
  AssetsSelectorComponentInput
>;
