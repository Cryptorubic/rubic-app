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

  public startWatchContract(id) {
    return this.httpService.get('confirm_swaps_info/', {
      contract_id: id
    }).toPromise();
  }
}
