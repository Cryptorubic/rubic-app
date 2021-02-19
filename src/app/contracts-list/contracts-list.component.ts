import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { ContractsService } from '../services/contracts/contracts.service';
import { UserService } from '../services/user/user.service';

import { Observable } from 'rxjs';
import { CONTRACT_STATES } from '../contract-preview/contract-states';
import { UserInterface } from '../services/user/user.interface';
import { MatDialog, MatDialogRef } from '@angular/material';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss']
})
export class ContractsListComponent implements OnInit {
  public contractsList: any[] = [];
  public states = CONTRACT_STATES;
  private contractForDeleting;
  public selectedFilter: any;

  @ViewChild('deleteConfirmation') deleteConfirmation;
  private deleteConfirmationModal: MatDialogRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private contractsService: ContractsService,
    private http: HttpClient
  ) {
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      if (userProfile.is_ghost) {
        this.router.navigate(['/trades']);
      }
    });

    const contractListData = this.route.snapshot.data.contracts;

    let serverDateTimeRange = 0;
    this.http
      .get('/assets/images/1x1.png?_t=' + new Date().getTime(), {
        responseType: 'text',
        observe: 'response'
      })
      .toPromise()
      .then(res => {
        serverDateTimeRange = new Date().getTime() - new Date(res.headers.get('Date')).getTime();
      });

    contractListData.map(item => {
      const leftTime =
        (new Date(item.stop_date).getTime() - (new Date().getTime() - serverDateTimeRange)) / 1000;

      if (leftTime <= 0) {
        item.left_times = {
          ts: 0,
          times_parts: [0, 0, 0]
        };
      } else {
        const days = Math.floor(leftTime / 86400);
        const hours = Math.floor((leftTime % 86400) / 3600);
        const minutes = Math.floor((leftTime % 3600) / 60);

        item.left_times = {
          ts: leftTime,
          times_parts: [days, hours, minutes]
        };
      }
    });

    this.contractsList = this.route.snapshot.data.contracts;
    console.log('this.contractsList', this.contractsList);
    this.selectedFilter = {};
  }

  ngOnInit() {}

  public toContract(contract) {
    if (!contract.contract_type) {
      if (!(contract.base_address && contract.quote_address)) {
        switch (contract.state) {
          case 'CREATED':
          case 'WAITING_FOR_PAYMENT':
            this.router.navigate([`/view-v3${contract.id}`]);
            break;
          default:
            this.router.navigate([`/public-v3/${contract.unique_link}`]);
            break;
        }
      } else {
        this.router.navigate([`/public-v3/${contract.unique_link}`]);
      }
    } else {
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

  public deleteContractConfirm() {
    this.contractsList = this.contractsList.filter(existsContract => {
      return existsContract !== this.contractForDeleting;
    });

    if (this.contractForDeleting.contract_type === 20) {
      this.contractsService.deleteContract(this.contractForDeleting).then(() => {});
    } else {
      this.contractsService.deleteSwap(this.contractForDeleting.id).then(() => {});
    }

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

  public applySort(sortName?: any) {
    if (sortName) {
      if (this.selectedFilter.name && this.selectedFilter.asc) {
        sortName = undefined;
      }
      this.selectedFilter = {
        name: sortName,
        asc: this.selectedFilter.name === sortName
      };
    }

    switch (this.selectedFilter.name) {
      case 'creation':
        this.contractsList = this.contractsList.sort((contract1, contract2) => {
          if (this.selectedFilter.asc) {
            return new Date(contract1.created_date).getTime() >
              new Date(contract2.created_date).getTime()
              ? 1
              : -1;
          } else {
            return new Date(contract2.created_date).getTime() >
              new Date(contract1.created_date).getTime()
              ? 1
              : -1;
          }
        });
        break;
      case 'expire':
        this.contractsList = this.contractsList.sort((contract1, contract2) => {
          const date1 = contract1.stop_date || contract1.contract_details.stop_date;
          const date2 = contract2.stop_date || contract2.contract_details.stop_date;

          if (this.selectedFilter.asc) {
            return new Date(date1).getTime() > new Date(date2).getTime() ? 1 : -1;
          } else {
            return new Date(date2).getTime() > new Date(date1).getTime() ? 1 : -1;
          }
        });
        break;

      case 'status':
        this.contractsList = this.contractsList.sort((contract1, contract2) => {
          if (this.selectedFilter.asc) {
            return this.states[contract1.state].NUMBER > this.states[contract2.state].NUMBER
              ? 1
              : -1;
          } else {
            return this.states[contract2.state].NUMBER > this.states[contract1.state].NUMBER
              ? 1
              : -1;
          }
        });

        break;

      default:
        this.contractsList = this.contractsList.sort((contract1, contract2) => {
          return new Date(contract2.created_date) < new Date(contract1.created_date) ? -1 : 1;
        });
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
