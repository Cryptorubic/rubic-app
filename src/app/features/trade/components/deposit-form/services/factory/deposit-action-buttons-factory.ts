import { BlockchainName, BlockchainsInfo, CHAIN_TYPE } from '@cryptorubic/core';
import { ActionButtonStatesMap } from '../../models/deposit-form-step-actions';
import { DEPOSIT_STEP_ORDER } from '../../models/deposit-step-order';

export class DepositActionButtonsFactory {
  public static create(srcChain: BlockchainName, isMobile: boolean): ActionButtonStatesMap {
    const srcChainType = BlockchainsInfo.getChainType(srcChain);
    if (srcChainType === CHAIN_TYPE.EVM) {
      return this.createForEvm(isMobile);
    } else {
      return this.createForNonEvm(isMobile);
    }
  }

  private static createForEvm(isMobile: boolean): ActionButtonStatesMap {
    return {
      [DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS]: {
        select_manual_flow: {
          invisible: false,
          active: true,
          text: isMobile ? 'Manual' : 'Send Manually'
        },
        select_via_wallet: {
          invisible: false,
          active: true,
          text: isMobile ? 'Wallet' : 'Use Wallet'
        }
      },
      [DEPOSIT_STEP_ORDER.INPUT_ADDRESSES]: {
        change_addresses: { invisible: true, active: false, text: 'Change Addresses' },
        confirm_addresses: { invisible: true, active: false, text: 'Confirm' }
      },
      [DEPOSIT_STEP_ORDER.TRADE_INFO]: {
        confirm_deposit: { invisible: true, active: false, text: 'Done' },
        send_via_wallet: { invisible: false, active: true, text: 'Continue in Wallet' }
      },
      [DEPOSIT_STEP_ORDER.TRADE_STATUS]: {}
    };
  }

  private static createForNonEvm(isMobile: boolean): ActionButtonStatesMap {
    return {
      [DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS]: {
        select_manual_flow: {
          invisible: true,
          active: false,
          text: isMobile ? 'Manual' : 'Send Manually'
        },
        select_via_wallet: {
          invisible: true,
          active: false,
          text: isMobile ? 'Wallet' : 'Use Wallet'
        }
      },
      [DEPOSIT_STEP_ORDER.INPUT_ADDRESSES]: {
        change_addresses: { invisible: false, active: false, text: 'Change Addresses' },
        confirm_addresses: { invisible: false, active: false, text: 'Confirm' }
      },
      [DEPOSIT_STEP_ORDER.TRADE_INFO]: {
        confirm_deposit: { invisible: false, active: true, text: 'Done' },
        send_via_wallet: { invisible: true, active: false, text: 'Continue in Wallet' }
      },
      [DEPOSIT_STEP_ORDER.TRADE_STATUS]: {}
    };
  }
}
