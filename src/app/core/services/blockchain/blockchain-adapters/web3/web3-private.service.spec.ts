// import { TestBed } from '@angular/core/testing';
// import { HttpClient, HttpHandler } from '@angular/common/http';
// import BigNumber from 'bignumber.js';
// import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
// import { CookieService } from 'ngx-cookie-service';
// import { TranslateModule } from '@ngx-translate/core';
// import providerServiceStub from 'src/app/core/services/blockchain/providers/private-provider/metamask-provider/metamask-provider.stub';
// import { WEENUS } from 'src/test/tokens/blockchain-tokens/ethereum-test-tokens';
// import * as config from 'src/test/enviroment.test.json';
// import { BlockchainPublicService } from 'src/app/core/services/blockchain/blockchain-public/blockchain-public.service';
// import { MetamaskProvider } from 'src/app/core/services/blockchain/providers/private-provider/metamask-provider/metamask-provider';
// import { BlockchainPublicAdapter } from 'src/app/core/services/blockchain/blockchain-public/types';
//
// describe('Web3PrivateService', () => {
//   let originalTimeout: number;
//
//   const bobAddress = config.testReceiverAddress;
//   let service: Web3PrivateService;
//   let blockchainPublicAdapter: BlockchainPublicAdapter;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [
//         HttpClient,
//         HttpHandler,
//         { provide: MetamaskProvider, useValue: providerServiceStub() },
//         BlockchainPublicService,
//         CookieService
//       ],
//       imports: [TranslateModule.forRoot()]
//     });
//     originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
//     jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
//     blockchainPublicAdapter =
//       TestBed.inject(BlockchainPublicService).adapters[BLOCKCHAIN_NAME.ETHEREUM];
//     service = TestBed.inject(Web3PrivateService);
//   });
//
//   afterEach(() => {
//     jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//     // @ts-ignore
//     expect(service.address).toBeTruthy();
//   });
//
//   it('should use Kovan network id', () => {
//     // const { network } = service;
//     // expect(network).toBeTruthy();
//     // expect(network.id).toBe(42);
//   });
//
//   it('send transaction', async done => {
//     const amount = new BigNumber(0.001);
//     const bobStartBalance = await blockchainPublicAdapter.getBalance(bobAddress);
//     const callbackObject = {
//       onTransactionHash: (_hash: string) => {}
//     };
//     spyOn(callbackObject, 'onTransactionHash');
//
//     const receipt = await service.sendTransaction(bobAddress, amount, {
//       onTransactionHash: callbackObject.onTransactionHash.bind(callbackObject)
//     });
//
//     expect(callbackObject.onTransactionHash).toHaveBeenCalledWith(
//       jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
//     );
//
//     expect(receipt).not.toBe(undefined);
//     expect(receipt.blockNumber).toBeGreaterThan(0);
//     const bobNewBalance = await blockchainPublicAdapter.getBalance(bobAddress);
//
//     expect(bobNewBalance.minus(bobStartBalance).toString()).toBe(amount.toString());
//     done();
//   });
//
//   it('send tokens', async done => {
//     const amount = new BigNumber(3).multipliedBy(10 ** WEENUS.decimals);
//     const bobStartBalance = await blockchainPublicAdapter.getTokenBalance(
//       bobAddress,
//       WEENUS.address
//     );
//     const callbackObject = {
//       onTransactionHash: (_hash: string) => {}
//     };
//     spyOn(callbackObject, 'onTransactionHash');
//
//     const receipt = await service.transferTokens(WEENUS.address, bobAddress, amount, {
//       onTransactionHash: callbackObject.onTransactionHash.bind(callbackObject)
//     });
//
//     expect(callbackObject.onTransactionHash).toHaveBeenCalledWith(
//       jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
//     );
//
//     expect(receipt).not.toBe(undefined);
//     expect(receipt.blockNumber).toBeGreaterThan(0);
//     const bobNewBalance = await blockchainPublicAdapter.getTokenBalance(bobAddress, WEENUS.address);
//
//     expect(bobNewBalance.minus(bobStartBalance).toString()).toBe(amount.toString());
//     done();
//   });
//
//   it('approve', async done => {
//     const amount = new BigNumber(2.39).multipliedBy(10 ** WEENUS.decimals);
//     const callbackObject = {
//       onTransactionHash: (_hash: string) => {}
//     };
//     spyOn(callbackObject, 'onTransactionHash');
//
//     const receipt = await service.approveTokens(WEENUS.address, bobAddress, amount, {
//       onTransactionHash: callbackObject.onTransactionHash.bind(callbackObject)
//     });
//
//     expect(callbackObject.onTransactionHash).toHaveBeenCalledWith(
//       jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
//     );
//
//     expect(receipt).not.toBe(undefined);
//     expect(receipt.blockNumber).toBeGreaterThan(0);
//     const bobNewAllowance = await blockchainPublicAdapter.getAllowance(
//       WEENUS.address,
//       // @ts-ignore
//       service.address,
//       bobAddress
//     );
//
//     expect(bobNewAllowance.toString()).toBe(amount.toString());
//     done();
//   });
//
//   it('unApprove', async done => {
//     await service.unApprove(WEENUS.address, bobAddress);
//
//     const allowance = await blockchainPublicAdapter.getAllowance(
//       WEENUS.address,
//       // @ts-ignore
//       service.address,
//       bobAddress
//     );
//
//     expect(allowance.eq(0)).toBeTruthy();
//     done();
//   });
// });
