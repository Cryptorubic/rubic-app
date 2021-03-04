import { TestBed } from '@angular/core/testing';

import { UniSwapService } from './uni-swap.service';
import BigNumber from 'bignumber.js';

import { HttpClientModule } from '@angular/common/http';
import { ProviderService } from '../../blockchain/provider/provider.service';
import providerServiceStub from '../../blockchain/provider/provider-service-stub';
import { ETH, WEENUS, YEENUS } from '../../../../test/tokens/eth-tokens';
import { Web3ApiService } from '../../blockchain/web3PrivateService/web3-api.service';
import { UniSwapContractAddress } from './uni-swap-contract';
import { PublicProviderService } from '../../blockchain/publicProvider/public-provider.service';
import publicProviderServiceStub from '../../blockchain/publicProvider/public-provider-service-stub';
import { Web3PublicService } from '../../blockchain/web3PublicService/web3-public.service';
import { Web3Public } from '../../blockchain/web3PublicService/Web3Public';
import { BLOCKCHAIN_NAME } from '../../blockchain/types/Blockchain';

describe('UniswapServiceService', () => {
  let originalTimeout: number;
  let service: UniSwapService;
  let web3Private: Web3ApiService;
  let web3PublicEth: Web3Public;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Web3ApiService,
        { provide: ProviderService, useValue: providerServiceStub() },
        { provide: PublicProviderService, useValue: publicProviderServiceStub() }
      ],
      imports: [HttpClientModule]
    });
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

    web3PublicEth = TestBed.get(Web3PublicService)[BLOCKCHAIN_NAME.ETHEREUM];
    service = TestBed.get(UniSwapService);
    web3Private = TestBed.get(Web3ApiService);
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('calculate token-token price', async done => {
    const fromAmount = new BigNumber(2);

    await web3Private.approveTokens(
      WEENUS.address,
      UniSwapContractAddress,
      new BigNumber(3).multipliedBy(10 ** WEENUS.decimals)
    );

    const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS);
    expect(trade).toBeTruthy();
    expect(trade.to.amount.gt(0)).toBeTruthy();
    expect(trade.estimatedGas.eq(UniSwapService.tokensToTokensEstimatedGas)).not.toBeTruthy();
    console.log(trade.estimatedGas);
    done();
  });

  it('calculate token-token without allowance price', async done => {
    const fromAmount = new BigNumber(2);

    await web3Private.unApprove(WEENUS.address, UniSwapContractAddress);

    const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS);
    expect(trade).toBeTruthy();
    expect(trade.to.amount.gt(0)).toBeTruthy();
    expect(trade.estimatedGas.eq(UniSwapService.tokensToTokensEstimatedGas)).toBeTruthy();
    console.log(trade.estimatedGas);
    done();
  });

  it('calculate token-token price with allowance but not required balance', async done => {
    const fromAmount = new BigNumber(200_000_000);

    await web3Private.approveTokens(
      WEENUS.address,
      UniSwapContractAddress,
      fromAmount.multipliedBy(10 ** WEENUS.decimals)
    );

    const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS);
    expect(trade).toBeTruthy();
    expect(trade.to.amount.gt(0)).toBeTruthy();
    expect(trade.estimatedGas.eq(UniSwapService.tokensToTokensEstimatedGas)).toBeTruthy();
    console.log(trade.estimatedGas);
    done();
  });

  it('calculate eth-token price', async done => {
    const fromAmount = new BigNumber(0.2);

    const trade = await service.calculateTrade(fromAmount, ETH, YEENUS);
    expect(trade).toBeTruthy();
    expect(trade.to.amount.gt(0)).toBeTruthy();
    console.log(trade.estimatedGas);
    done();
  });

  it('calculate eth-token price with no required balance', async done => {
    const fromAmount = new BigNumber(200_000);

    const trade = await service.calculateTrade(fromAmount, ETH, YEENUS);
    expect(trade).toBeTruthy();
    expect(trade.to.amount.gt(0)).toBeTruthy();
    expect(trade.estimatedGas.eq(UniSwapService.ethToTokensEstimatedGas)).toBeTruthy();
    console.log(trade.estimatedGas);
    done();
  });

  it('calculate token-eth price', async done => {
    const fromAmount = new BigNumber(2);

    await web3Private.approveTokens(
      WEENUS.address,
      UniSwapContractAddress,
      new BigNumber(3).multipliedBy(10 ** WEENUS.decimals)
    );

    const trade = await service.calculateTrade(fromAmount, WEENUS, ETH);
    expect(trade).toBeTruthy();
    expect(trade.to.amount.gt(0)).toBeTruthy();
    expect(trade.estimatedGas.eq(UniSwapService.tokensToEthEstimatedGas)).not.toBeTruthy();
    console.log(trade.estimatedGas);
    done();
  });

  it('calculate token-eth price without allowance', async done => {
    const fromAmount = new BigNumber(2);

    await web3Private.unApprove(WEENUS.address, UniSwapContractAddress);

    const trade = await service.calculateTrade(fromAmount, WEENUS, ETH);
    expect(trade).toBeTruthy();
    expect(trade.to.amount.gt(0)).toBeTruthy();
    expect(trade.estimatedGas.eq(UniSwapService.tokensToEthEstimatedGas)).toBeTruthy();
    console.log(trade.estimatedGas);
    done();
  });

  it('create tokens-tokens trade without allowance', async done => {
    await web3Private.unApprove(WEENUS.address, UniSwapContractAddress);

    const fromAmount = new BigNumber(2);
    const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(
      100
    );

    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    const callbackObject = {
      onConfirm: (hash: string) => {},
      onApprove: (hash: string) => {}
    };
    spyOn(callbackObject, 'onConfirm');
    spyOn(callbackObject, 'onApprove');

    const startBalance = await web3Private.getTokenBalance(YEENUS.address);

    await service.createTrade(trade, {
      onConfirm: callbackObject.onConfirm.bind(callbackObject),
      onApprove: callbackObject.onApprove.bind(callbackObject)
    });

    expect(callbackObject.onApprove).toHaveBeenCalledWith(
      jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
    );
    expect(callbackObject.onConfirm).toHaveBeenCalledWith(
      jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
    );
    const newBalance = await web3Private.getTokenBalance(YEENUS.address);

    expect(newBalance.minus(startBalance).gte(outputMinAmount)).toBeTruthy();

    await web3Private.unApprove(WEENUS.address, UniSwapContractAddress);
    done();
  });

  it('create tokens-tokens trade with existing allowance', async done => {
    const fromAmount = new BigNumber(2);

    await web3Private.approveTokens(
      WEENUS.address,
      UniSwapContractAddress,
      fromAmount.multipliedBy(10 ** WEENUS.decimals)
    );

    const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(
      100
    );
    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    const callbackObject = {
      onConfirm: (hash: string) => {},
      onApprove: (hash: string) => {}
    };
    spyOn(callbackObject, 'onConfirm');
    spyOn(callbackObject, 'onApprove');

    const startBalance = await web3Private.getTokenBalance(YEENUS.address);

    await service.createTrade(trade, {
      onConfirm: callbackObject.onConfirm.bind(callbackObject),
      onApprove: callbackObject.onApprove.bind(callbackObject)
    });

    expect(callbackObject.onApprove).not.toHaveBeenCalled();
    expect(callbackObject.onConfirm).toHaveBeenCalledWith(
      jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
    );
    const newBalance = await web3Private.getTokenBalance(YEENUS.address);

    expect(newBalance.minus(startBalance).gte(outputMinAmount)).toBeTruthy();

    await web3Private.unApprove(WEENUS.address, UniSwapContractAddress);
    done();
  });

  it('create eth-tokens trade', async done => {
    const fromAmount = new BigNumber(0.05);
    const trade = await service.calculateTrade(fromAmount, ETH, YEENUS);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(
      100
    );
    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    const callbackObject = {
      onConfirm: (hash: string) => {}
    };
    spyOn(callbackObject, 'onConfirm');

    const startBalance = await web3Private.getTokenBalance(YEENUS.address);

    await service.createTrade(trade, {
      onConfirm: callbackObject.onConfirm.bind(callbackObject)
    });

    expect(callbackObject.onConfirm).toHaveBeenCalledWith(
      jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
    );
    const newBalance = await web3Private.getTokenBalance(YEENUS.address);

    expect(newBalance.minus(startBalance).gte(outputMinAmount)).toBeTruthy();
    done();
  });

  it('create tokens-eth trade without existing allowance', async done => {
    await web3Private.unApprove(WEENUS.address, UniSwapContractAddress);

    const fromAmount = new BigNumber(30);
    const trade = await service.calculateTrade(fromAmount, WEENUS, ETH);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(
      100
    );
    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    let gasFee = new BigNumber(0);

    const callbackObject = {
      onConfirm: (hash: string) => {},
      onApprove: async (hash: string) => {
        const approveTxGasFee = await web3Private.getTransactionGasFee(hash);
        gasFee = gasFee.plus(approveTxGasFee);
      }
    };
    spyOn(callbackObject, 'onConfirm');
    spyOn(callbackObject, 'onApprove').and.callThrough();

    const startBalance = await web3Private.getBalance();

    const receipt = await service.createTrade(trade, {
      onConfirm: callbackObject.onConfirm.bind(callbackObject),
      onApprove: callbackObject.onApprove.bind(callbackObject)
    });

    const txGasFee = await web3Private.getTransactionGasFee(receipt.transactionHash);
    gasFee = gasFee.plus(txGasFee);

    expect(callbackObject.onConfirm).toHaveBeenCalledWith(
      jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
    );
    expect(callbackObject.onApprove).toHaveBeenCalledWith(
      jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
    );
    const newBalance = await web3Private.getBalance();

    expect(newBalance.minus(startBalance).gte(outputMinAmount.minus(gasFee))).toBeTruthy();

    await web3Private.unApprove(WEENUS.address, UniSwapContractAddress);

    done();
  });

  it('create tokens-eth trade with existing allowance', async done => {
    await web3Private.unApprove(WEENUS.address, UniSwapContractAddress);

    const fromAmount = new BigNumber(28);

    await web3Private.approveTokens(
      WEENUS.address,
      UniSwapContractAddress,
      fromAmount.multipliedBy(10 ** WEENUS.decimals)
    );

    const trade = await service.calculateTrade(fromAmount, WEENUS, ETH);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(
      100
    );
    const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));

    const callbackObject = {
      onConfirm: (hash: string) => {},
      onApprove: (hash: string) => {}
    };
    spyOn(callbackObject, 'onConfirm');
    spyOn(callbackObject, 'onApprove');

    const startBalance = await web3Private.getBalance();

    const receipt = await service.createTrade(trade, {
      onConfirm: callbackObject.onConfirm.bind(callbackObject),
      onApprove: callbackObject.onApprove.bind(callbackObject)
    });

    const txGasFee = await web3Private.getTransactionGasFee(receipt.transactionHash);
    const gasFee = new BigNumber(txGasFee);

    expect(callbackObject.onConfirm).toHaveBeenCalledWith(
      jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
    );
    expect(callbackObject.onApprove).not.toHaveBeenCalled();

    const newBalance = await web3Private.getBalance();

    expect(newBalance.minus(startBalance).gte(outputMinAmount.minus(gasFee))).toBeTruthy();

    await web3Private.unApprove(WEENUS.address, UniSwapContractAddress);
    done();
  });
});
