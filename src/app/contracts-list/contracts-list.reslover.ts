import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContractsService } from '../core/services/contracts/contracts.service';
import { UserService } from '../core/services/user/user.service';

@Injectable()
export class ContractsListResolver implements Resolve<any> {
  constructor(
    private contractsService: ContractsService,
    private userService: UserService,
    private router: Router
  ) {}

  resolve() {
    return new Observable(observer => {
      const subscription = this.userService.getCurrentUser(false, true).subscribe(user => {
        if (!user.is_ghost) {
          this.contractsService.getContractsList().then(contracts => {
            observer.next(contracts);
            observer.complete();
          });
        } else {
          this.router.navigate(['/trades']);
        }
        subscription.unsubscribe();
      });
      return {
        unsubscribe() {}
      };
    });
  }
}
