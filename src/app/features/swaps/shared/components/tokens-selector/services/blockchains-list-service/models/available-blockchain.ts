import { BlockchainName } from 'rubic-sdk';

export interface AvailableBlockchain {
  name: BlockchainName;
  icon: string;
  label: string;

  disabledConfiguration: boolean;
  disabledFrom: boolean;
}
