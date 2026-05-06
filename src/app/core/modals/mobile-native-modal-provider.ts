import { tuiAsPortal } from '@taiga-ui/cdk/portals';
import { MobileNativeModalService } from './services/mobile-native-modal.service';

export const MOBILE_NATIVE_MODAL_PROVIDER = tuiAsPortal(MobileNativeModalService);
