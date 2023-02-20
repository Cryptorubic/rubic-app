import { Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { WindowSize } from '../services/widnow-width-service/models/window-size';
import { WindowWidthService } from '../services/widnow-width-service/window-width.service';
import { MobileNativeModalService } from './services/mobile-native-modal.service';

/**
 * Modal Service Factory based on screen size
 * @param windowWidth Screen size
 * @param injector Injector
 * @returns Modal Dialog Service
 */
export function modalServiceFactory(windowWidth: WindowWidthService, injector: Injector) {
  if (windowWidth.windowSize <= WindowSize.MOBILE_MD) {
    return injector.get(MobileNativeModalService);
  }
  return injector.get(TuiDialogService);
}
