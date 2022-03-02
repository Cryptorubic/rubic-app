import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ENVIRONMENT } from 'src/environments/environment';
import { StakingService } from './staking.service';

@Injectable()
export class StakingRoundResolver implements Resolve<boolean> {
  constructor(private readonly stakingService: StakingService) {}

  resolve(route: ActivatedRouteSnapshot): boolean {
    if (route.routeConfig.path.includes('round-one')) {
      this.stakingService.setStakingContractAddress(ENVIRONMENT.staking.roundOneContractAddress);
      return true;
    }

    if (route.routeConfig.path.includes('round-two')) {
      this.stakingService.setStakingContractAddress(ENVIRONMENT.staking.roundTwoContractAddress);
      return true;
    }
  }
}
