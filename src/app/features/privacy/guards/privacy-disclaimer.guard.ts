import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ModalService } from '@app/core/modals/services/modal.service';
import { StoreService } from '@core/services/store/store.service';

export const privacyDisclaimerGuard: CanActivateFn = async () => {
  const modalService = inject(ModalService);
  const store = inject(StoreService);
  const router = inject(Router);

  const storeData = store.getItem('FIRST_TIME_PRIVACY');
  const firstTimeUser = storeData === undefined ? true : storeData;
  if (firstTimeUser) {
    const modalResult = await modalService.showDisclaimer();
    const accept = modalResult || false;
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
