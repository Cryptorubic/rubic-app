import { TestBed } from '@angular/core/testing';

import { UniSwapService } from './uni-swap.service';
import BigNumber from 'bignumber.js';

import { HttpClientModule } from '@angular/common/http';
import {ProviderService} from '../../provider/provider.service';
import providerServiceStub from '../../provider/provider-service-stub';
import {ETH, WEENUS, YEENUS} from '../../../../test/tokens/eth-tokens';
import {Web3ApiService} from '../../web3Api/web3-api.service';
import {UniSwapContractAddress} from './uni-swap-contract';


describe('UniswapServiceService', () => {

  let originalTimeout: number;
  let service: UniSwapService;
  let web3Api: Web3ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ Web3ApiService, { provide: ProviderService, useValue: providerServiceStub() }],
      imports: [ HttpClientModule ]
    });
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

    service = TestBed.get(UniSwapService);
    web3Api = TestBed.get(Web3ApiService);
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('calculate price', async (done) => {
    const fromAmount = new BigNumber(2);

    const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS);
    expect(trade).toBeTruthy();
    expect(trade.to.amount.gt(0)).toBeTruthy();
    done();
  });

  it('create tokens-tokens trade without allowance', async (done) => {

    await web3Api.unApprove(WEENUS.address, UniSwapContractAddress);

    const fromAmount = new BigNumber(2);
    const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(100);

    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    const callbackObject = {
      onConfirm: (hash: string) => { },
      onApprove: (hash: string) => { }
    };
    spyOn(callbackObject, 'onConfirm');
    spyOn(callbackObject, 'onApprove');

    const startBalance = await web3Api.getTokenBalance(YEENUS.address);

    await service.createTrade(trade, {
      onConfirm: callbackObject.onConfirm.bind(callbackObject),
      onApprove: callbackObject.onApprove.bind(callbackObject)
    });

    expect(callbackObject.onApprove).toHaveBeenCalledWith(jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/));
    expect(callbackObject.onConfirm).toHaveBeenCalledWith(jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/));
    const newBalance = await web3Api.getTokenBalance(YEENUS.address);

    expect(newBalance.minus(startBalance).gte(outputMinAmount)).toBeTruthy();

    await web3Api.unApprove(WEENUS.address, UniSwapContractAddress);
    done();
  });

  it('create tokens-tokens trade with existing allowance', async (done) => {
    const fromAmount = new BigNumber(2);

    await web3Api.approveTokens(WEENUS.address, UniSwapContractAddress, fromAmount.multipliedBy(10 ** WEENUS.decimals));

    const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(100);
    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    const callbackObject = {
      onConfirm: (hash: string) => { },
      onApprove: (hash: string) => { }
    };
    spyOn(callbackObject, 'onConfirm');
    spyOn(callbackObject, 'onApprove');

    const startBalance = await web3Api.getTokenBalance(YEENUS.address);

    await service.createTrade(trade, {
      onConfirm: callbackObject.onConfirm.bind(callbackObject),
      onApprove: callbackObject.onApprove.bind(callbackObject)
    });

    expect(callbackObject.onApprove).not.toHaveBeenCalled();
    expect(callbackObject.onConfirm).toHaveBeenCalledWith(jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/));
    const newBalance = await web3Api.getTokenBalance(YEENUS.address);

    expect(newBalance.minus(startBalance).gte(outputMinAmount)).toBeTruthy();

    await web3Api.unApprove(WEENUS.address, UniSwapContractAddress);
    done();
  });

  it('create eth-tokens trade', async (done) => {
    const fromAmount = new BigNumber(0.05);
    const trade = await service.calculateTrade(fromAmount, ETH, YEENUS);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(100);
    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    const callbackObject = {
      onConfirm: (hash: string) => { },
    };
    spyOn(callbackObject, 'onConfirm');

    const startBalance = await web3Api.getTokenBalance(YEENUS.address);

    await service.createTrade(trade, {
      onConfirm: callbackObject.onConfirm.bind(callbackObject)
    });

    expect(callbackObject.onConfirm).toHaveBeenCalledWith(jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/));
    const newBalance = await web3Api.getTokenBalance(YEENUS.address);

    expect(newBalance.minus(startBalance).gte(outputMinAmount)).toBeTruthy();
    done();
  });

  it('create tokens-eth trade without existing allowance', async (done) => {
    await web3Api.unApprove(WEENUS.address, UniSwapContractAddress);

    const fromAmount = new BigNumber(30);
    const trade = await service.calculateTrade(fromAmount, WEENUS, ETH);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(100);
    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    let gasFee = new BigNumber(0);

    const callbackObject = {
      onConfirm: (hash: string) => { },
      onApprove: async (hash: string) => {
        const approveTxGasFee = await web3Api.getTransactionGasFee(hash);
        gasFee = gasFee.plus(approveTxGasFee);
      }
    };
    spyOn(callbackObject, 'onConfirm');
    spyOn(callbackObject, 'onApprove').and.callThrough();

    const startBalance = await web3Api.getBalance();

    const receipt = await service.createTrade(trade, {
      onConfirm: callbackObject.onConfirm.bind(callbackObject),
      onApprove: callbackObject.onApprove.bind(callbackObject)
    });

    const txGasFee = await web3Api.getTransactionGasFee(receipt.transactionHash);
    gasFee = gasFee.plus(txGasFee);

    expect(callbackObject.onConfirm).toHaveBeenCalledWith(jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/));
    const newBalance = await web3Api.getBalance();

    expect(
        newBalance.minus(startBalance)
            .gte(outputMinAmount.minus(gasFee))
    ).toBeTruthy();

    await web3Api.unApprove(WEENUS.address, UniSwapContractAddress);

    done();
  });
});
