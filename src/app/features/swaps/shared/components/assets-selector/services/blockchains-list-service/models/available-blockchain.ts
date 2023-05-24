import { BlockchainName } from 'rubic-sdk';

export interface AvailableBlockchain {
  rank: number;

  name: BlockchainName;
  icon: string;
  label: string;

  disabledConfiguration: boolean;
  disabledFrom: boolean;
  disabledLimitOrder: boolean;
}
