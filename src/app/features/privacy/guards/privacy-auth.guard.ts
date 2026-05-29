import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { ModalService } from '@app/core/modals/services/modal.service';
import { PrivacyAuthService } from '../services/privacy-auth.service';
import { firstValueFrom } from 'rxjs';

export const privacyAuthGuard: CanActivateFn = async (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const modalService = inject(ModalService);
  const privacyAuthService = inject(PrivacyAuthService);
  const router = inject(Router);

  const authorized = await firstValueFrom(privacyAuthService.authorized$);
  if (authorized) return true;

  const resp = await modalService.openPrivacyAuthModal();
  if (resp.forceClosed) {
    router.navigate(['/'], { queryParamsHandling: 'merge' });
    return false;
  }
  return resp.valid;
};
