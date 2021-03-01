import { TestBed } from '@angular/core/testing';

import { Web3ApiService } from './web3-api.service';
import { ProviderService } from '../provider/provider.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import BigNumber from 'bignumber.js';
import providerServiceStub from '../provider/provider-service-stub';
import { WEENUS } from '../../../test/tokens/eth-tokens';
import { coingeckoTestTokens } from '../../../test/tokens/coingecko-tokens';
// @ts-ignore
import config from '../../../test/enviroment.test.json';
import { BLOCKCHAIN_NAMES } from '../../pages/main-page/trades-form/types';

describe('Web3ApiService', () => {
  let originalTimeout;

  const bobAddress = config.testReceiverAddress;
  let service: Web3ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        { provide: ProviderService, useValue: providerServiceStub() }
      ]
    });
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    service = TestBed.get(Web3ApiService);
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.address).toBeTruthy();
  });

  it('should use Kovan network id', () => {
    const network = service.network;
    expect(network).toBeTruthy();
    expect(network.id).toBe(42);
  });

  it('get balance works', async done => {
    const balance = await service.getBalance();
    expect(balance).not.toBe(undefined);
    expect(balance.gt(0)).toBeTruthy();
    done();
  });

  it('balance of works (tokens)', async done => {
    const balance = await service.getTokenBalance(WEENUS.address);
    expect(balance).not.toBe(undefined);
    expect(balance.gt(0)).toBeTruthy();
    done();
  });

  it('send transaction', async done => {
    const amount = new BigNumber(0.001);
    const bobStartBalance = await service.getBalance({ address: bobAddress });
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
    expect(receipt.blockNumber > 0).toBeTruthy();
    const bobNewBalance = await service.getBalance({ address: bobAddress });
    expect(bobNewBalance.minus(bobStartBalance).toString()).toBe(amount.toString());
    done();
  });

  it('send tokens', async done => {
    const amount = new BigNumber(3).multipliedBy(10 ** WEENUS.decimals);
    const bobStartBalance = await service.getTokenBalance(WEENUS.address, { address: bobAddress });
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
    expect(receipt.blockNumber > 0).toBeTruthy();
    const bobNewBalance = await service.getTokenBalance(WEENUS.address, { address: bobAddress });
    expect(bobNewBalance.minus(bobStartBalance).toString()).toBe(amount.toString());
    done();
  });

  it('allowance', async done => {
    const allowance = await service.getAllowance(WEENUS.address, bobAddress);

    console.log(allowance);
    expect(allowance).not.toBe(undefined);
    expect(allowance.gte(0)).toBeTruthy();
    done();
  });

  it('approve', async done => {
    const amount = new BigNumber(2.39).multipliedBy(10 ** WEENUS.decimals);
    const bobStartAllowance = await service.getAllowance(WEENUS.address, bobAddress);
    console.log(bobStartAllowance.toString());
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
    expect(receipt.blockNumber > 0).toBeTruthy();
    const bobNewAllowance = await service.getAllowance(WEENUS.address, bobAddress);
    expect(bobNewAllowance.minus(bobStartAllowance).toString()).toBe(amount.toString());
    done();
  });

  it('unApprove', async done => {
    await service.unApprove(WEENUS.address, bobAddress);

    const allowance = await service.getAllowance(WEENUS.address, bobAddress);

    expect(allowance.eq(0)).toBeTruthy();
    done();
  });

  it('tokenInfo', async done => {
    const weenusBody = coingeckoTestTokens.find(t => t.address === WEENUS.address);
    let tokenBody = await service.getTokenInfo(WEENUS.address, BLOCKCHAIN_NAMES.ETHEREUM);

    expect(tokenBody.name === weenusBody.token_title).toBeTruthy();
    expect(tokenBody.symbol === weenusBody.token_short_title).toBeTruthy();
    expect(tokenBody.decimals === weenusBody.decimals).toBeTruthy();

    done();
  });
});
