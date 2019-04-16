import { Injectable } from '@angular/core';
import {HttpService} from '../http/http.service';

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

  public updateContract(data) {
    return this.httpService.patch(`contracts/${data.id}/`, data).toPromise();
  }

  public getContract(id) {
    return this.httpService.get(`contracts/${id}/`).toPromise();
  }

  public getContractsList() {
    return this.httpService.get('contracts/').toPromise();
  }

  public getPublicContractsList() {
    return this.httpService.get('get_public_contracts/').toPromise();
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

  public deleteContract(contract) {
    return this.httpService.delete(`contracts/${contract.id}/`).toPromise();
  }

}
