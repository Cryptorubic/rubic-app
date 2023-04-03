import { Provider } from '@angular/core';
import { TUI_DIALOGS } from '@taiga-ui/cdk';
import { MobileNativeModalService } from './services/mobile-native-modal.service';

export const MOBILE_NATIVE_MODAL_PROVIDER: Provider = {
  provide: TUI_DIALOGS,
  useExisting: MobileNativeModalService,
  multi: true
};
