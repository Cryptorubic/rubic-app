// describe('UniSwapService', () => {
//   let originalTimeout: number;
//   let service: UniswapAbstract;
//   let web3Private: Web3PrivateService;
//   let web3PublicEth: Web3Public;
//   let uniSwapContractAddress: string;
//   let providerConnectorService: ProviderConnectorService;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [
//         UniSwapService,
//         Web3PrivateService,
//         ProviderConnectorService,
//         { provide: MetamaskProvider, useValue: providerServiceStub() },
//         { provide: PublicProviderService, useValue: publicProviderServiceStub() }
//       ],
//       imports: [HttpClientModule]
//     });
//     originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
//     jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
//
//     web3PublicEth = TestBed.inject(Web3PublicService)[BLOCKCHAIN_NAME.ETHEREUM];
//     service = TestBed.inject(UniSwapService);
//     web3Private = TestBed.inject(Web3PrivateService);
//     uniSwapContractAddress = uniSwapContracts.testnetAddress;
//     providerConnectorService = TestBed.inject(ProviderConnectorService);
//   });
//
//   afterEach(() => {
//     jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
//
//   it('calculate token-token price with allowance and short path', async done => {
//     const fromAmount = new BigNumber(2);
//
//     await web3Private.approveTokens(
//       WEENUS.address,
//       uniSwapContractAddress,
//       new BigNumber(3).multipliedBy(10 ** WEENUS.decimals)
//     );
//
//     const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS, false);
//
//     expect(trade).toBeTruthy();
//     expect(trade.to.amount.gt(0)).toBeTruthy();
//     expect(trade.estimatedGas.eq(service.tokensToTokensEstimatedGas[0])).not.toBeTruthy();
//     done();
//   });
//
//   it('calculate token-token without allowance price', async done => {
//     const fromAmount = new BigNumber(2);
//
//     await web3Private.unApprove(WEENUS.address, uniSwapContractAddress);
//
//     const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS, false);
//
//     expect(trade).toBeTruthy();
//     expect(trade.to.amount.gt(0)).toBeTruthy();
//     expect(trade.estimatedGas.eq(service.tokensToTokensEstimatedGas[0])).toBeTruthy();
//     done();
//   });
//
//   it('calculate token-token price with allowance but not required balance', async done => {
//     const fromAmount = new BigNumber(200_000_000);
//
//     await web3Private.approveTokens(
//       WEENUS.address,
//       uniSwapContractAddress,
//       fromAmount.multipliedBy(10 ** WEENUS.decimals)
//     );
//
//     const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS, false);
//
//     expect(trade).toBeTruthy();
//     expect(trade.to.amount.gt(0)).toBeTruthy();
//     expect(trade.estimatedGas.eq(service.tokensToTokensEstimatedGas[0])).toBeTruthy();
//     done();
//   });
//
//   it('calculate eth-token price', async done => {
//     const fromAmount = new BigNumber(0.2);
//
//     const trade = await service.calculateTrade(fromAmount, ETH, YEENUS, false);
//
//     expect(trade).toBeTruthy();
//     expect(trade.to.amount.gt(0)).toBeTruthy();
//     done();
//   });
//
//   it('calculate eth-token price with no required balance', async done => {
//     const fromAmount = new BigNumber(200_000);
//
//     const trade = await service.calculateTrade(fromAmount, ETH, YEENUS, false);
//
//     expect(trade).toBeTruthy();
//     expect(trade.to.amount.gt(0)).toBeTruthy();
//     expect(trade.estimatedGas.eq(service.ethToTokensEstimatedGas[0])).toBeTruthy();
//     done();
//   });
//
//   it('calculate token-eth price', async done => {
//     const fromAmount = new BigNumber(2);
//
//     await web3Private.approveTokens(
//       WEENUS.address,
//       uniSwapContractAddress,
//       new BigNumber(3).multipliedBy(10 ** WEENUS.decimals)
//     );
//
//     const trade = await service.calculateTrade(fromAmount, WEENUS, ETH, false);
//
//     expect(trade).toBeTruthy();
//     expect(trade.to.amount.gt(0)).toBeTruthy();
//     expect(trade.estimatedGas.eq(service.tokensToEthEstimatedGas[0])).not.toBeTruthy();
//     done();
//   });
//
//   it('calculate token-eth price without allowance', async done => {
//     const fromAmount = new BigNumber(2);
//
//     await web3Private.unApprove(WEENUS.address, uniSwapContractAddress);
//
//     const trade = await service.calculateTrade(fromAmount, WEENUS, ETH, false);
//
//     expect(trade).toBeTruthy();
//     expect(trade.to.amount.gt(0)).toBeTruthy();
//     expect(trade.estimatedGas.eq(service.tokensToEthEstimatedGas[0])).toBeTruthy();
//     done();
//   });
//
//   it('create tokens-tokens trade without allowance', async done => {
//     await web3Private.unApprove(WEENUS.address, uniSwapContractAddress);
//
//     const fromAmount = new BigNumber(2);
//     const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS, false);
//     // @ts-ignore
//     const percentSlippage = service.slippagePercent;
//
//     const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));
//
//     const callbackObject = {
//       onConfirm: (hash: string) => {},
//       onApprove: (hash: string) => {}
//     };
//     spyOn(callbackObject, 'onConfirm');
//     spyOn(callbackObject, 'onApprove');
//
//     const startBalance = await web3PublicEth.getTokenBalance(
//       providerConnectorService.address,
//       YEENUS.address
//     );
//
//     await service.createTrade(trade, {
//       onConfirm: callbackObject.onConfirm,
//       onApprove: callbackObject.onApprove
//     });
//
//     expect(callbackObject.onApprove).toHaveBeenCalledWith(
//       jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
//     );
//
//     expect(callbackObject.onConfirm).toHaveBeenCalledWith(
//       jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
//     );
//     const newBalance = await web3PublicEth.getTokenBalance(
//       providerConnectorService.address,
//       YEENUS.address
//     );
//
//     expect(newBalance.minus(startBalance).gte(outputMinAmount)).toBeTruthy();
//
//     await web3Private.unApprove(WEENUS.address, uniSwapContractAddress);
//     done();
//   });
//
//   it('create tokens-tokens trade with existing allowance', async done => {
//     const fromAmount = new BigNumber(2);
//
//     await web3Private.approveTokens(
//       WEENUS.address,
//       uniSwapContractAddress,
//       fromAmount.multipliedBy(10 ** WEENUS.decimals)
//     );
//
//     const trade = await service.calculateTrade(fromAmount, WEENUS, YEENUS, false);
//     // @ts-ignore
//     const percentSlippage = service.slippagePercent;
//     const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));
//
//     const callbackObject = {
//       onConfirm: (hash: string) => {},
//       onApprove: (hash: string) => {}
//     };
//     spyOn(callbackObject, 'onConfirm');
//     spyOn(callbackObject, 'onApprove');
//
//     const startBalance = await web3PublicEth.getTokenBalance(
//       providerConnectorService.address,
//       YEENUS.address
//     );
//
//     await service.createTrade(trade, {
//       onConfirm: callbackObject.onConfirm,
//       onApprove: callbackObject.onApprove
//     });
//
//     expect(callbackObject.onApprove).not.toHaveBeenCalled();
//     expect(callbackObject.onConfirm).toHaveBeenCalledWith(
//       jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
//     );
//     const newBalance = await web3PublicEth.getTokenBalance(
//       providerConnectorService.address,
//       YEENUS.address
//     );
//
//     expect(newBalance.minus(startBalance).gte(outputMinAmount)).toBeTruthy();
//
//     await web3Private.unApprove(WEENUS.address, uniSwapContractAddress);
//     done();
//   });
//
//   it('create eth-tokens trade', async done => {
//     const fromAmount = new BigNumber(0.05);
//     const trade = await service.calculateTrade(fromAmount, ETH, YEENUS, false);
//     // @ts-ignore
//     const percentSlippage = service.slippagePercent;
//     const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));
//
//     const callbackObject = {
//       onConfirm: (hash: string) => {}
//     };
//     spyOn(callbackObject, 'onConfirm');
//
//     const startBalance = await web3PublicEth.getTokenBalance(
//       providerConnectorService.address,
//       YEENUS.address
//     );
//
//     await service.createTrade(trade, {
//       onConfirm: callbackObject.onConfirm.bind(callbackObject)
//     });
//
//     expect(callbackObject.onConfirm).toHaveBeenCalledWith(
//       jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
//     );
//     const newBalance = await web3PublicEth.getTokenBalance(
//       providerConnectorService.address,
//       YEENUS.address
//     );
//
//     expect(newBalance.minus(startBalance).gte(outputMinAmount)).toBeTruthy();
//     done();
//   });
//
//   it('create tokens-eth trade without existing allowance', async done => {
//     await web3Private.unApprove(WEENUS.address, uniSwapContractAddress);
//
//     const fromAmount = new BigNumber(30);
//     const trade = await service.calculateTrade(fromAmount, WEENUS, ETH, false);
//     // @ts-ignore
//     const percentSlippage = service.slippagePercent;
//     const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));
//
//     let gasFee = new BigNumber(0);
//
//     const callbackObject = {
//       onConfirm: (hash: string) => {},
//       onApprove: async (hash: string) => {
//         const approveTxGasFee = await web3PublicEth.getTransactionGasFee(hash);
//         gasFee = gasFee.plus(approveTxGasFee);
//       }
//     };
//     spyOn(callbackObject, 'onConfirm');
//     spyOn(callbackObject, 'onApprove').and.callThrough();
//
//     const startBalance = await web3PublicEth.getBalance(providerConnectorService.address);
//
//     const receipt = await service.createTrade(trade, {
//       onConfirm: callbackObject.onConfirm,
//       onApprove: callbackObject.onApprove
//     });
//
//     const txGasFee = await web3PublicEth.getTransactionGasFee(receipt.transactionHash);
//     gasFee = gasFee.plus(txGasFee);
//
//     expect(callbackObject.onConfirm).toHaveBeenCalledWith(
//       jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
//     );
//
//     expect(callbackObject.onApprove).toHaveBeenCalledWith(
//       jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
//     );
//     const newBalance = await web3PublicEth.getBalance(providerConnectorService.address);
//
//     expect(newBalance.minus(startBalance).gte(outputMinAmount.minus(gasFee))).toBeTruthy();
//
//     await web3Private.unApprove(WEENUS.address, uniSwapContractAddress);
//
//     done();
//   });
//
//   it('create tokens-eth trade with existing allowance', async done => {
//     await web3Private.unApprove(WEENUS.address, uniSwapContractAddress);
//
//     const fromAmount = new BigNumber(28);
//
//     await web3Private.approveTokens(
//       WEENUS.address,
//       uniSwapContractAddress,
//       fromAmount.multipliedBy(10 ** WEENUS.decimals)
//     );
//
//     const trade = await service.calculateTrade(fromAmount, WEENUS, ETH, false);
//     // @ts-ignore
//     const percentSlippage = service.slippagePercent;
//     const outputMinAmount = trade.to.amount.multipliedBy(new BigNumber(1).minus(percentSlippage));
//
//     const callbackObject = {
//       onConfirm: (hash: string) => {},
//       onApprove: (hash: string) => {}
//     };
//     spyOn(callbackObject, 'onConfirm');
//     spyOn(callbackObject, 'onApprove');
//
//     const startBalance = await web3PublicEth.getBalance(providerConnectorService.address);
//
//     const receipt = await service.createTrade(trade, {
//       onConfirm: callbackObject.onConfirm,
//       onApprove: callbackObject.onApprove
//     });
//
//     const txGasFee = await web3PublicEth.getTransactionGasFee(receipt.transactionHash);
//     const gasFee = new BigNumber(txGasFee);
//
//     expect(callbackObject.onConfirm).toHaveBeenCalledWith(
//       jasmine.stringMatching(/^0x([A-Fa-f0-9]{64})$/)
//     );
//
//     expect(callbackObject.onApprove).not.toHaveBeenCalled();
//
//     const newBalance = await web3PublicEth.getBalance(providerConnectorService.address);
//
//     expect(newBalance.minus(startBalance).gte(outputMinAmount.minus(gasFee))).toBeTruthy();
//
//     await web3Private.unApprove(WEENUS.address, uniSwapContractAddress);
//     done();
//   });
// });
