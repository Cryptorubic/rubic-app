import { Injector, Component, Type, ElementRef } from '@angular/core';
import { TuiDialog } from '@taiga-ui/cdk';
import { TuiDialogContext } from '@taiga-ui/core';
import { Observable } from 'rxjs';

export interface IMobileNativeOptions {
  title?: string;
  data?: object;
  fitContent?: boolean;
  scrollableContent?: boolean;
  forceClose$?: Observable<void>;
  nextModal$?: Observable<INextModal>;
  previousComponent?: boolean;
  showMobileMenu?: boolean;
}

export interface INextModal extends IMobileNativeOptions {
  component?: Type<Component & object>;
  data?: object;
  injector?: Injector;
}

export type ModalName =
  | 'navigation'
  | 'rubic-menu'
  | 'settings'
  | 'profile'
  | 'wallet'
  | 'claim'
  | 'token-selector'
  | 'other-provider-list'
  | 'ccr-settings'
  | 'onchain-settings'
  | 'arbitrum-warning'
  | 'deposit-trade-rate-change'
  | 'rate-change'
  | 'mev-bot'
  | 'wc-change-network'
  | 'ton-slippage-warning'
  | 'swap-retry-pending'
  | 'swap-backup-rate-changed'
  | 'all-swap-backups-failed'
  | 'trustline-modal';

export interface ModalStruct {
  name: ModalName;
  elRef: ElementRef<HTMLElement>;
  context: TuiDialog<IMobileNativeOptions, void> | TuiDialogContext<void, object>;
}
