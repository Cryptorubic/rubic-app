import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export enum SoundEvent {
  ON_TOKEN_SELECT = 'ON_TOKEN_SELECT',
  ON_CHAIN_SELECT = 'ON_CHAIN_SELECT',
  ON_SWAP_START = 'ON_SWAP_START',
  ON_SWAP_FINISHED = 'ON_SWAP_FINISHED'
}
export type SoundConfig = Partial<Record<BlockchainName, Record<SoundEvent, HTMLAudioElement>>>;
const basePath = 'assets/sounds/';

export const soundsConfig: SoundConfig = {
  [BLOCKCHAIN_NAME.MONAD_TESTNET]: {
    ON_CHAIN_SELECT: new Audio(`${basePath}select-chain.mp3`),
    ON_TOKEN_SELECT: new Audio(`${basePath}select-token.mp3`),
    ON_SWAP_FINISHED: new Audio(`${basePath}finish-swap.mp3`),
    ON_SWAP_START: new Audio(`${basePath}start-swap.mp3`)
  }
};
