import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import BigNumber from 'bignumber.js';
import { Web3PrivateService } from './web3-private.service';
import providerServiceStub from '../private-provider/metamask-provider/metamask-provider.service.stub';
// @ts-ignore
import config from '../../../../../test/enviroment.test.json';
import { PublicProviderService } from '../public-provider/public-provider.service';
import publicProviderServiceStub from '../public-provider/public-provider-service-stub';
import { Web3PublicService } from '../web3-public-service/web3-public.service';
import { Web3Public } from '../web3-public-service/Web3Public';
import { WEENUS } from '../../../../../test/tokens/eth-tokens';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { MetamaskProvider } from '../private-provider/metamask-provider/metamask-provider';

describe('Web3PrivateService', () => {
  let originalTimeout;

  const bobAddress = config.testReceiverAddress;
  let service: Web3PrivateService;
  let web3PublicEth: Web3Public;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        { provide: MetamaskProvider, useValue: providerServiceStub() },
        { provide: PublicProviderService, useValue: publicProviderServiceStub() },
        Web3PublicService
      ]
    });
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    web3PublicEth = TestBed.get(Web3PublicService)[BLOCKCHAIN_NAME.ETHEREUM];
    service = TestBed.get(Web3PrivateService);
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect((service as any).address).toBeTruthy();
  });

  it('should use Kovan network id', () => {
    // const { network } = service;
    // expect(network).toBeTruthy();
    // expect(network.id).toBe(42);
  });

  it('send transaction', async done => {
    const amount = new BigNumber(0.001);
    const bobStartBalance = await web3PublicEth.getBalance(bobAddress);
    const callbackObject = {
      onTransactionHash: (hash: string) => {}
    };
    spyOn(callbackObject, 'onTransactionHash');

    const receipt = await service.sendTransaction(bobAddress, amount, {
      onTransactionHash: callbackObject.onTransactionHash.bind(callbackObject)
    });

    expect(callbackObject.onTransactionHash).toHaveBeenCalledWith(
      jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
    );

    expect(receipt).not.toBe(undefined);
    expect(receipt.blockNumber).toBeGreaterThan(0);
    const bobNewBalance = await web3PublicEth.getBalance(bobAddress);

    expect(bobNewBalance.minus(bobStartBalance).toString()).toBe(amount.toString());
    done();
  });

  it('send tokens', async done => {
    const amount = new BigNumber(3).multipliedBy(10 ** WEENUS.decimals);
    const bobStartBalance = await web3PublicEth.getTokenBalance(bobAddress, WEENUS.address);
    const callbackObject = {
      onTransactionHash: (hash: string) => {}
    };
    spyOn(callbackObject, 'onTransactionHash');

    const receipt = await service.transferTokens(WEENUS.address, bobAddress, amount, {
      onTransactionHash: callbackObject.onTransactionHash.bind(callbackObject)
    });

    expect(callbackObject.onTransactionHash).toHaveBeenCalledWith(
      jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
    );

    expect(receipt).not.toBe(undefined);
    expect(receipt.blockNumber).toBeGreaterThan(0);
    const bobNewBalance = await web3PublicEth.getTokenBalance(bobAddress, WEENUS.address);

    expect(bobNewBalance.minus(bobStartBalance).toString()).toBe(amount.toString());
    done();
  });

  it('approve', async done => {
    const amount = new BigNumber(2.39).multipliedBy(10 ** WEENUS.decimals);
    const callbackObject = {
      onTransactionHash: (hash: string) => {}
    };
    spyOn(callbackObject, 'onTransactionHash');

    const receipt = await service.approveTokens(WEENUS.address, bobAddress, amount, {
      onTransactionHash: callbackObject.onTransactionHash.bind(callbackObject)
    });

    expect(callbackObject.onTransactionHash).toHaveBeenCalledWith(
      jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
    );

    expect(receipt).not.toBe(undefined);
    expect(receipt.blockNumber).toBeGreaterThan(0);
    const bobNewAllowance = await web3PublicEth.getAllowance(
      WEENUS.address,
      (service as any).address,
      bobAddress
    );

    expect(bobNewAllowance.toString()).toBe(amount.toString());
    done();
  });

  it('unApprove', async done => {
    await service.unApprove(WEENUS.address, bobAddress);

    const allowance = await web3PublicEth.getAllowance(
      WEENUS.address,
      (service as any).address,
      bobAddress
    );

    expect(allowance.eq(0)).toBeTruthy();
    done();
  });
});
