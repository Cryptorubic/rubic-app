import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GasFormActivationGuard {
  constructor(private readonly router: Router) {}

  public canActivate(): boolean {
    this.router.navigate(['/']);
    return false;
  }
}
