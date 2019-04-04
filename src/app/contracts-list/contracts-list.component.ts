import {Component, Injectable, OnInit} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router} from '@angular/router';
import {ContractsService} from '../services/contracts/contracts.service';
import {UserService} from '../services/user/user.service';

import {Observable} from 'rxjs';
import {CONTRACT_STATES} from '../contract-preview/contract-states';

@Component({
  selector: 'app-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss']
})
export class ContractsListComponent implements OnInit {

  public contractsList: any[] = [];
  public states = CONTRACT_STATES;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {

    console.log(this.states);
    console.log(this.route.snapshot.data.contracts.results);
    this.contractsList = this.route.snapshot.data.contracts.results;
  }

  ngOnInit() {
  }

  public toContract(contract) {
    switch (contract.state) {
      case 'CREATED':
      case 'WAITING_FOR_PAYMENT':
      case 'WAITING_FOR_DEPLOYMENT':
        this.router.navigate([`/view/${contract.id}`]);
        break;
      default:
        this.router.navigate([`/contract/${contract.id}`]);
        break;
    }
  }

}





@Injectable()
export class ContractsListResolver implements Resolve<any> {
  constructor(
    private contractsService: ContractsService,
    private userService: UserService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    return new Observable((observer) => {
      const subscription = this.userService.getCurrentUser(false, true).subscribe((user) => {
        if (!user.is_ghost) {
          this.contractsService.getContractsList().then((contracts) => {
            observer.next(contracts);
            observer.complete();
          });
        } else {
          this.router.navigate(['/']);
        }
        subscription.unsubscribe();
      });
      return {
        unsubscribe() {}
      };
    });
  }
}
