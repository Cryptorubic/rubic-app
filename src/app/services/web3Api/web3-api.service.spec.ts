import { TestBed } from '@angular/core/testing';

import { Web3ApiService } from './web3-api.service';
import {ProviderService} from '../provider/provider.service';
import Web3 from 'web3';
import {HttpClient, HttpHandler} from '@angular/common/http';
import BigNumber from 'bignumber.js';


describe('Web3ApiService', () => {
  let originalTimeout;

  const alice = {
    address: '0x3aEC01681910210dD33a3687AA4585fd4d200A1c',
    privateKey: 'eeeb77b9401cb7655de8ae508d207bb0e38bddf196c310fa6b65675a1f2166aa'
  }
  const bobAddress = '0xecA0A3eFCf009519052Dc92306fE821b9c7A32A2';
  const providerLink = 'https://kovan.infura.io/v3/9e85c637c9204e6f9779354562fcde7d';
  const defaultGasLimit = '400000';

  const providerServiceStub = () => {
    const web3 = new Web3(providerLink);
    web3.eth.accounts.wallet.add(alice.privateKey);
    return ({
      web3,
      connection: providerLink,
      address: alice.address
    })
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler, { provide: ProviderService, useValue: providerServiceStub() }]
    });
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should be created', () => {
    const service: Web3ApiService = TestBed.get(Web3ApiService);
    expect(service).toBeTruthy();
    expect(service.address).toBeTruthy();
  });

  it('get balance works', async (done) => {
    const service: Web3ApiService = TestBed.get(Web3ApiService);
    const balance = await service.getBalance();
    expect(balance).not.toBe(undefined);
    expect(balance.gt(0)).toBeTruthy();
    done();
  })

  it ('should send transaction', async (done) => {
    const service: Web3ApiService = TestBed.get(Web3ApiService);
    const amount = new BigNumber(0.001);
    const bobStartBalance = await service.getBalance({address: bobAddress});
    const callbackObject = {
      onTransactionHash: function (hash: string) { console.log(hash) }
    }
    spyOn(callbackObject, 'onTransactionHash');

    const receipt = await service.sendTransaction(bobAddress, amount,
        { onTransactionHash: callbackObject.onTransactionHash.bind(callbackObject), gas: defaultGasLimit});

    expect(callbackObject.onTransactionHash).toHaveBeenCalledWith(jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/))
    expect(receipt).not.toBe(undefined);
    expect(receipt.blockNumber > 0).toBeTruthy();
    const bobNewBalance = await service.getBalance({ address: bobAddress} );
    expect(bobNewBalance.minus(bobStartBalance).toString()).toBe(amount.toString());
    done();
  });
});
