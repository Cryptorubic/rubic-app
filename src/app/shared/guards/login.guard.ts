import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard {
  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly router: Router
  ) {}

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const redirectPath = route.data.path as string;
    if (this.walletConnectorService.address) {
      return of(true);
    } else {
      this.router.navigateByUrl(redirectPath);
      return of(false);
    }
  }
}
