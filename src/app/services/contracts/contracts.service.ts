import { Injectable } from '@angular/core';
import {HttpService} from '../http/http.service';
import {IContractV3} from '../../contract-form-all/contract-form-all.component';

export interface InterfacePastSwaps {
  total: number;
  pages: number;
  list: any[];
  inProgress?: boolean;
  page?: number;
}


@Injectable({
  providedIn: 'root'
})

export class ContractsService {

  constructor(
    private httpService: HttpService
  ) { }

  public createContract(data) {
    return this.httpService.post('contracts/', data).toPromise();
  }

  public createSWAP3(data) {
    return this.httpService.post('create_swap3/', data).toPromise();
  }

  public updateSWAP3(data) {
    return this.httpService.post(`edit_swap3/${data.id}/`, data).toPromise();
  }


  public getPastTrades(filters?) {
    return this.httpService.get(`get_non_active_swap3/`, filters).toPromise().
    then((result: {total: number, pages: number, list: any[]}) => {
      result.list = result.list.sort((contract1, contract2) => {
        return new Date(contract2.stop_date) < new Date(contract1.stop_date) ? -1 : 1;
      });
      return result;
    });
  }



  public getContractV3Information(id) {
    return this.httpService.get(`get_swap3/`, {
      swap_id: id
    }).toPromise().then((result) => {
      if (result.base_address && result.quote_address) {
        result.isEthereum = true;
      } else {
        result.state = (result.state !== 'WAITING_FOR_ACTIVATION') ? result.state : 'ACTIVE';
      }
      return result as InterfacePastSwaps;
    });
  }

  public updateContract(data) {
    return this.httpService.patch(`contracts/${data.id}/`, data).toPromise();
  }

  public getContract(id) {
    return this.httpService.get(`contracts/${id}/`).toPromise();
  }

  public cancelSWAP3(id) {
    return this.httpService.post('cancel_swap3/', {
      id
    }).toPromise().then((res) => {
      return res;
    });
  }

  public getContractsList() {
    const allList: {
      contracts?: any[],
      trades?: any[]
    } = {};
    return new Promise((resolve, reject) => {

      const resolveList = () => {
        if (allList.trades && allList.contracts) {
          const allResolveList = allList.contracts.concat(allList.trades).sort((contract1, contract2) => {
            return new Date(contract2.created_date) < new Date(contract1.created_date) ? -1 : 1;
          });
          resolve(allResolveList);
        }
      };

      this.httpService.get('contracts/').toPromise().then((result) => {
        allList.contracts = result.results.filter((contract) => {
          return contract.contract_type === 20;
        });
        resolveList();
      });

      this.httpService.get('get_user_swap3/').toPromise().then((result) => {
        allList.trades = result;
        resolveList();
      });

    });
  }

  public getPublicContractsList() {
    const allList: {
      contracts?: any[],
      trades?: any[]
    } = {};
    return new Promise((resolve, reject) => {

      const resolveList = () => {
        if (allList.trades && allList.contracts) {
          const allResolveList = allList.contracts.concat(allList.trades).sort((contract1, contract2) => {
            return new Date(contract2.created_date) < new Date(contract1.created_date) ? -1 : 1;
          });
          resolve(allResolveList);

          if (expiredTrades.contracts || expiredTrades.trades) {
            this.httpService.post('set_swap3_expired/', expiredTrades).toPromise().then((res) => {
              return res;
            });
          }
        }
      };

      const expiredTrades = {
        contracts: [],
        trades: []
      };

      this.httpService.get('get_public_contracts/').toPromise().then((result) => {
        allList.contracts = result.filter((contract) => {
          const noExpired = new Date(contract.contract_details.stop_date).getTime() > new Date().getTime();
          if (!noExpired) {
            expiredTrades.contracts.push(contract.id);
          }
          return noExpired;
        });
        resolveList();
      });

      this.httpService.get('get_public_swap3/').toPromise().then((result) => {
        allList.trades = result.filter((contract) => {
          const noExpired = new Date(contract.stop_date).getTime() > new Date().getTime();
          if (!noExpired) {
            expiredTrades.trades.push(contract.id);
          }
          return noExpired;
        });
        resolveList();
      });
    }).then((res) => {
      return res;
    });
  }

  public startWatchContract(id) {
    return this.httpService.post('confirm_swaps_info/', {
      contract_id: id
    }).toPromise();
  }

  public getContractByPublic(publicLink) {
    return this.httpService.get(`get_contract_for_unique_link/`, {
      unique_link: publicLink
    }).toPromise();
  }

  public getSwapByPublic(publicLink) {
    return this.httpService.get(`get_swap3_for_unique_link/`, {
      unique_link: publicLink
    }).toPromise().then((result) => {
      if (result.base_address && result.quote_address) {
        result.isEthereum = true;
      } else {
        result.state = (result.state !== 'WAITING_FOR_ACTIVATION') ? result.state : 'ACTIVE';
      }
      return result;
    });
  }

  public changeContractState(id) {
    return this.httpService.post(`change_contract_state/`, {
      contract_id: id
    }).toPromise();
  }

  public deleteContract(contract) {
    return this.httpService.delete(`contracts/${contract.id}/`).toPromise();
  }

  public deleteSwap(contractId) {
    return this.httpService.post(`delete_swap3/`, {
      id: contractId
    }).toPromise();
  }

  public deleteTradeFromManager(tradeId) {
    return this.httpService.post(`admin_delete_swap3/`, {
      id: tradeId
    }).toPromise();
  }

}
