import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ModalService } from '@app/core/modals/services/modal.service';
import { PrivacycashSignatureService } from '../services/privacy-cash-signature.service';
import { ROUTE_PATH } from '@app/shared/constants/common/links';

export const privacycashSignatureGuard: CanActivateFn = async (_route, _state) => {
  const modalService = inject(ModalService);
  const router = inject(Router);
  const privacycashSignatureService = inject(PrivacycashSignatureService);

  if (privacycashSignatureService.signature) return true;
  //@TODO_1767 перенести модалку в PrivateModalsService
  const ok = await modalService.openPrivacycashSignatureModal().catch(() => false);
  if (!ok) {
    router.navigate(['/' + ROUTE_PATH.PRIVACY]);
    return false;
  }

  return true;
};
