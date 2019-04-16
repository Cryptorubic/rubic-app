import {Component, Injectable, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router} from '@angular/router';
import {ContractsService} from '../services/contracts/contracts.service';
import {UserService} from '../services/user/user.service';

import {Observable} from 'rxjs';
import {CONTRACT_STATES} from '../contract-preview/contract-states';
import {UserInterface} from '../services/user/user.interface';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss']
})
export class ContractsListComponent implements OnInit {

  public contractsList: any[] = [];
  public states = CONTRACT_STATES;
  private contractForDeleting;

  @ViewChild('deleteConfirmation') deleteConfirmation;
  private deleteConfirmationModal: MatDialogRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private contractsService: ContractsService
  ) {
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      if (userProfile.is_ghost) {
        this.router.navigate(['/']);
      }
    });

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

  public deleteContractConfirm() {
    this.contractsList = this.contractsList.filter((existsContract) => {
      return existsContract !== this.contractForDeleting;
    });
    this.contractsService.deleteContract(this.contractForDeleting).then(() => {

    });
    this.contractForDeleting = false;
    this.deleteConfirmationModal.close();
  }


  public deleteContract(contract) {
    this.contractForDeleting = contract;
    this.deleteConfirmationModal = this.dialog.open(this.deleteConfirmation, {
      width: '480px',
      panelClass: 'custom-dialog-container'
    });
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
