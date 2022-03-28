import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class StakingLpService {
  constructor(private readonly router: Router) {}

  public navigateToStaking(): void {
    this.router.navigate([]);
  }

  public navigateToLp(): void {
    this.router.navigate([]);
  }
}
