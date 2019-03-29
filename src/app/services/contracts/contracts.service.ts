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

  public getContract(id) {
    return this.httpService.get(`contracts/${id}/`).toPromise();
  }
}
