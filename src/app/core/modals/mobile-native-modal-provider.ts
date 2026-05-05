import { TUI_DIALOGS } from '@taiga-ui/core';
import { Provider } from '@angular/core';
import { MobileNativeModalService } from './services/mobile-native-modal.service';

export const MOBILE_NATIVE_MODAL_PROVIDER: Provider = {
  provide: TUI_DIALOGS,
  useExisting: MobileNativeModalService,
  multi: true
};
