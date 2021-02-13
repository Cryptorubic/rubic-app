import { TestBed } from '@angular/core/testing';

import { Web3ApiService } from './web3-api.service';
import {ProviderService} from '../provider/provider.service';
import Web3 from 'web3';
import {HttpClient, HttpHandler} from '@angular/common/http';


describe('Web3ApiService', () => {

  const providerServiceStub = {
    web3: new Web3('https://kovan.infura.io/v3/9e85c637c9204e6f9779354562fcde7d'),
    connection: 'https://kovan.infura.io/v3/9e85c637c9204e6f9779354562fcde7d',
    address: '0x3aEC01681910210dD33a3687AA4585fd4d200A1c'
  }

  beforeEach(() => TestBed.configureTestingModule({
    providers: [HttpClient, HttpHandler, { provide: ProviderService, useValue: providerServiceStub }]
  }));

  it('should be created', () => {
    const service: Web3ApiService = TestBed.get(Web3ApiService);
    expect(service).toBeTruthy();
    console.log(service.address);
    service.getBalance().then(result => {
      expect(result).not.toBe(undefined);
      console.log(result.toString());
    })
  });
});
