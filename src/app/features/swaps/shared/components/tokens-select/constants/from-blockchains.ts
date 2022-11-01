import { BlockchainsAsideComponent } from '@features/swaps/shared/components/tokens-select/components/blockchains-aside/blockchains-aside.component';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

export const fromBlockchains = BlockchainsAsideComponent.allBlockchains.filter(
  blockchain => blockchain !== BLOCKCHAIN_NAME.BITCOIN
);
