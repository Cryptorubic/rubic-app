import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ModalService } from '@app/core/modals/services/modal.service';
import { StoreService } from '@core/services/store/store.service';
import { firstValueFrom } from 'rxjs';
import { PrivacyAuthService } from '../services/privacy-auth.service';

export const privacyDisclaimerGuard: CanActivateFn = async () => {
  const modalService = inject(ModalService);
  const store = inject(StoreService);
  const router = inject(Router);
  const privacyAuthService = inject(PrivacyAuthService);

  const storeData = store.getItem('FIRST_TIME_PRIVACY');
  const firstTimeUser = storeData === undefined ? true : storeData;
  if (firstTimeUser) {
    const modalResult = await modalService.showDisclaimer();
    const accept = modalResult || false;

    const authorized = await firstValueFrom(privacyAuthService.authorized$);
    if (!authorized) return false;

    if (accept) {
      store.setItem('FIRST_TIME_PRIVACY', false);
      return true;
    } else {
      router.navigate(['/'], { queryParamsHandling: 'merge' });
      return false;
    }
  }
  return true;
};
