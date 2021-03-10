import { TestBed } from '@angular/core/testing';

import { Web3PublicService } from './web3-public.service';
import { PublicProviderService } from '../public-provider/public-provider.service';

import { Web3Public } from './Web3Public';
// @ts-ignore
import config from '../../../../test/enviroment.test.json';
import publicProviderServiceStub from '../public-provider/public-provider-service-stub';

import ERC20_TOKEN_ABI from '../constants/erc-20-abi';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { ETH, WEENUS } from '../../../../../test/tokens/eth-tokens';
import { WEENUS_ABI } from '../../../../../test/tokens/tokens-abi';
import { coingeckoTestTokens } from '../../../../../test/tokens/coingecko-tokens';

describe('Web3PublicService', () => {
  let service: Web3PublicService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PublicProviderService, useValue: publicProviderServiceStub() }]
    });
    service = TestBed.get(Web3PublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  executeWeb3PublicTests(BLOCKCHAIN_NAME.ETHEREUM);

  function executeWeb3PublicTests(blockchainName: BLOCKCHAIN_NAME) {
    describe('Web3Public', function () {
      const aliceAddress = config.testWallet.address;
      const bobAddress = config.testReceiverAddress;
      const getWeb3Public: () => Web3Public = () => service[blockchainName];

      it('get balance works', async done => {
        const balance = await getWeb3Public().getBalance(aliceAddress);

        expect(balance).not.toBe(undefined);
        expect(balance.gt(0)).toBeTruthy();
        done();
      });

      it('balance of works (tokens)', async done => {
        const balance = await getWeb3Public().getTokenBalance(aliceAddress, WEENUS.address);

        expect(balance).not.toBe(undefined);
        expect(balance.gt(0)).toBeTruthy();
        done();
      });

      it('allowance', async done => {
        const allowance = await getWeb3Public().getAllowance(
          WEENUS.address,
          bobAddress,
          aliceAddress
        );

        console.log(allowance);

        expect(allowance).not.toBe(undefined);
        expect(allowance.gte(0)).toBeTruthy();
        done();
      });

      it('gas limit calculation works', async done => {
        switch (blockchainName) {
          case BLOCKCHAIN_NAME.ETHEREUM:
            {
              const gasFee = await getWeb3Public().getEstimatedGas(
                WEENUS_ABI,
                WEENUS.address,
                'transfer',
                [bobAddress, '30'],
                aliceAddress
              );

              expect(gasFee?.gt(0)).toBeTruthy();
            }
            break;
        }

        done();
      });

      it('gas price calculation works', async done => {
        const gasPrice = await getWeb3Public().getGasPriceInETH();

        expect(gasPrice?.gt(0)).toBeTruthy();
        done();
      });

      it('get transaction gas fee works', async done => {
        let txHash;
        let txRealFee;
        switch (blockchainName) {
          case BLOCKCHAIN_NAME.ETHEREUM:
            txHash = '0x95952a6d4fbdf941d2c4d57b173c33a2ec67c8cb0280c50499021ed933c778f3';
            txRealFee = 0.004341885;
            break;
        }
        const gasFee = await getWeb3Public().getTransactionGasFee(txHash);

        expect(gasFee.eq(txRealFee)).toBeTruthy();
        done();
      });

      it('call contract method works', async done => {
        const weenusSymbol = await getWeb3Public().callContractMethod(
          WEENUS.address,
          ERC20_TOKEN_ABI,
          'symbol'
        );

        expect(weenusSymbol === WEENUS.symbol).toBeTruthy();
        done();
      });

      it('is native address check works', () => {
        const isNativeAddress = getWeb3Public().isNativeAddress(ETH.address);

        expect(isNativeAddress).toBeTruthy();
      });

      it('get token info works correct', async done => {
        const weenus = coingeckoTestTokens.find(t => t.address === WEENUS.address);
        const tokenInfo = await getWeb3Public().getTokenInfo(WEENUS.address);

        expect(tokenInfo.name === weenus.token_title).toBeTruthy();
        expect(tokenInfo.symbol === weenus.token_short_title).toBeTruthy();
        expect(tokenInfo.decimals === weenus.decimals).toBeTruthy();

        done();
      });
    });
  }
});
