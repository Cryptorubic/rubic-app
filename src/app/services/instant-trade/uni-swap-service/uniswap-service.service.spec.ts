import { TestBed } from '@angular/core/testing';

import { UniSwapService } from './uni-swap.service';
import BigNumber from 'bignumber.js';

import { HttpClientModule } from '@angular/common/http';
import {ProviderService} from '../../provider/provider.service';
import providerServiceStub from '../../provider/provider-service-stub';
import { WEENUS, YEENUS} from '../../../../test/tokens/eth-tokens';
import {Web3ApiService} from '../../web3Api/web3-api.service';


describe('UniswapServiceService', () => {

  let originalTimeout: number;
  let service: UniSwapService;
  let web3Api: Web3ApiService;

  const clearAllowance = (tokenAddress, spenderAddress) => {
    web3Api.approveTokens(tokenAddress, spenderAddress, new BigNumber(0));
  };

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

    const trade = await service.getTrade(fromAmount, WEENUS, YEENUS);
    expect(trade).toBeTruthy();
    expect(trade.to.amount.gt(0)).toBeTruthy();
    done();
  });

  it('create trade with existing allowance', async (done) => {
    const fromAmount = new BigNumber(2);
    const trade = await service.getTrade(fromAmount, WEENUS, YEENUS);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(100);

    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    const callbackObject = {
      onConfirm: (hash: string) => { console.log('onConfirm'); },
      onApprove: (hash: string) => { console.log('onConfirm'); }
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
    done();
  });

  it('create trade without allowance', async (done) => {
    const fromAmount = new BigNumber(2);
    const trade = await service.getTrade(fromAmount, WEENUS, YEENUS);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(100);

    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    const callbackObject = {
      onConfirm: (hash: string) => { console.log('onConfirm'); },
      onApprove: (hash: string) => { console.log('onConfirm'); }
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
    done();
  });

});
