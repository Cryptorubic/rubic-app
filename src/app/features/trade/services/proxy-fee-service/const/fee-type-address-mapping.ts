import { PercentType } from '@features/trade/services/proxy-fee-service/models/percent-type';

export const percentAddress: Record<PercentType, string> = {
  default: '0xB6c5B85Df916Ad05f08863dEC9ac06D92de2eC68',
  zeroFee: '0x51c276f1392E87D4De6203BdD80c83f5F62724d4',
  onePercent: '0xC095e57dDfa5924BC56bEAcf1D515F154ac44e94',
  twoPercent: '0xE20c7F79DAEaBEB7a9D8cEffB73c4f857Be7fC27'
};
