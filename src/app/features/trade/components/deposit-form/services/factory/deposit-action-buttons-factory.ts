import { BlockchainName, BlockchainsInfo, CHAIN_TYPE } from '@cryptorubic/core';
import { ActionButtonStatesMap } from '../../models/deposit-form-step-actions';
import { DEPOSIT_STEP_ORDER } from '../../models/deposit-step-order';

export class DepositActionButtonsFactory {
  public static create(srcChain: BlockchainName): ActionButtonStatesMap {
    const srcChainType = BlockchainsInfo.getChainType(srcChain);
    if (srcChainType === CHAIN_TYPE.EVM) {
      return this.createForEvm();
    } else {
      return this.createForNonEvm();
    }
  }

  private static createForEvm(): ActionButtonStatesMap {
    return {
      [DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS]: {
        select_manual_flow: { invisible: false, active: true, text: 'Manual Transfer' },
        select_via_wallet: { invisible: false, active: true, text: 'Via Wallet' }
      },
      [DEPOSIT_STEP_ORDER.INPUT_ADDRESSES]: {
        change_addresses: { invisible: true, active: false, text: 'Change Addresses' },
        confirm_addresses: { invisible: true, active: false, text: 'Confirm' }
      },
      [DEPOSIT_STEP_ORDER.TRADE_INFO]: {
        confirm_deposit: { invisible: true, active: false, text: 'Deposit sent' },
        send_via_wallet: { invisible: false, active: true, text: 'Send' }
      },
      [DEPOSIT_STEP_ORDER.TRADE_STATUS]: {}
    };
  }

  private static createForNonEvm(): ActionButtonStatesMap {
    return {
      [DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS]: {
        select_manual_flow: { invisible: true, active: false, text: 'Manual Transfer' },
        select_via_wallet: { invisible: true, active: false, text: 'Via Wallet' }
      },
      [DEPOSIT_STEP_ORDER.INPUT_ADDRESSES]: {
        change_addresses: { invisible: false, active: false, text: 'Change Addresses' },
        confirm_addresses: { invisible: false, active: false, text: 'Confirm' }
      },
      [DEPOSIT_STEP_ORDER.TRADE_INFO]: {
        confirm_deposit: { invisible: false, active: true, text: 'Deposit sent' },
        send_via_wallet: { invisible: true, active: false, text: 'Send' }
      },
      [DEPOSIT_STEP_ORDER.TRADE_STATUS]: {}
    };
  }
}
