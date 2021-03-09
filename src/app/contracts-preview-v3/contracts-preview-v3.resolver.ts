import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ContractsService } from '../services/contracts/contracts.service';
import { HttpService } from '../services/http/http.service';
import { UserService } from '../services/user/user.service';
import { IContractV3 } from './contracts-preview-v3.component';
import { Web3ServiceLEGACY } from '../services/web3LEGACY/web3LEGACY.service';

@Injectable()
export class ContractEditV3Resolver implements Resolve<any> {
  private currentUser;

  private route;

  constructor(
    private contractsService: ContractsService,
    private userService: UserService,
    private httpService: HttpService,
    private web3Service: Web3ServiceLEGACY,
    private router: Router
  ) {}

  private contractId: number;

  private publicLink: string;

  private getContractInformation(observer, isPublic?) {
    const promise = (!isPublic
      ? this.contractsService.getContractV3Information(this.contractId)
      : this.contractsService.getSwapByPublic(this.publicLink)) as Promise<any>;

    promise.then(
      (trade: IContractV3) => {
        this.web3Service.getSWAPSCoinInfo(trade).then((result: any) => {
          observer.next(result);
          observer.complete();
        });
      },
      () => {
        this.router.navigate(['/trades']);
      }
    );
  }

  // eslint-disable-next-line consistent-return
  resolve(route: ActivatedRouteSnapshot) {
    this.route = route;
    if (route.params.id) {
      this.contractId = route.params.id;
      return new Observable(observer => {
        const subscription = this.userService.getCurrentUser(false, true).subscribe(user => {
          this.currentUser = user;
          if (!user.is_ghost) {
            this.getContractInformation(observer);
          } else {
            this.userService.openAuthForm().then(
              () => {
                this.getContractInformation(observer);
              },
              () => {
                this.router.navigate(['/trades']);
                //
              }
            );
          }
          subscription.unsubscribe();
        });
        return {
          unsubscribe() {}
        };
      });
    }
    if (route.params.public_link) {
      this.publicLink = route.params.public_link;
      return new Observable(observer => {
        this.getContractInformation(observer, true);
      });
    }
  }
}
