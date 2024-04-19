import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';

@Injectable({
  providedIn: 'root'
})
export class GasFormActivationGuard {
  constructor(
    private readonly router: Router,
    private readonly googleTagManagerService: GoogleTagManagerService
  ) {}

  public canActivate(): boolean {
    this.googleTagManagerService.fireGasFormGtm({ visitedFrom: 'fromUrl' });
    this.router.navigate(['/']);
    return false;
  }
}
