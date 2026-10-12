import { BlockchainName, BlockchainsInfo, CHAIN_TYPE } from '@cryptorubic/core';
import { DEPOSIT_STEP_ORDER } from '../../models/deposit-step-order';
import { DepositStepParams } from '../../models/step-types';

export class DepositStepParamsFactory {
  public static create(srcChain: BlockchainName): Record<DEPOSIT_STEP_ORDER, DepositStepParams> {
    const srcChainType = BlockchainsInfo.getChainType(srcChain);
    if (srcChainType === CHAIN_TYPE.EVM) {
      return this.createForEvm();
    } else {
      return this.createForNonEvm();
    }
  }

  private static createForEvm(): Record<DEPOSIT_STEP_ORDER, DepositStepParams> {
    return {
      [DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS]: {
        active: true,
        loading: false,
        opened: true,
        title: 'SWAP DETAILS'
      },
      [DEPOSIT_STEP_ORDER.INPUT_ADDRESSES]: {
        active: false,
        loading: false,
        opened: false,
        title: 'RECEIVER & REFUND ADDRESSES'
      },
      [DEPOSIT_STEP_ORDER.TRADE_INFO]: {
        active: false,
        loading: false,
        opened: false,
        title: 'SEND DEPOSIT'
      },
      [DEPOSIT_STEP_ORDER.TRADE_STATUS]: {
        active: false,
        loading: false,
        opened: false,
        title: 'SWAP STATUS'
      }
    };
  }

  private static createForNonEvm(): Record<DEPOSIT_STEP_ORDER, DepositStepParams> {
    return {
      [DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS]: {
        active: true,
        loading: false,
        opened: true,
        title: 'SWAP DETAILS'
      },
      [DEPOSIT_STEP_ORDER.INPUT_ADDRESSES]: {
        active: true,
        loading: false,
        opened: true,
        title: 'RECEIVER & REFUND ADDRESSES'
      },
      [DEPOSIT_STEP_ORDER.TRADE_INFO]: {
        active: false,
        loading: false,
        opened: false,
        title: 'SEND DEPOSIT'
      },
      [DEPOSIT_STEP_ORDER.TRADE_STATUS]: {
        active: false,
        loading: false,
        opened: false,
        title: 'SWAP STATUS'
      }
    };
  }
}
