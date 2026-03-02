import { CanActivateFn } from '@angular/router';

export const privacycashSignatureGuard: CanActivateFn = (_route, _state) => {
  // @TODO_1712 добавить модалку с подписью сообщения для privacycash
  return true;
};
