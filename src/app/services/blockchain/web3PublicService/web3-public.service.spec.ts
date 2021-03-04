import { TestBed } from '@angular/core/testing';

import { Web3PublicService } from './web3-public.service';
import { PublicProviderService } from '../publicProvider/public-provider.service';
import { BLOCKCHAIN_NAME } from '../types/Blockchain';
import { Web3Public } from './Web3Public';
//@ts-ignore
import config from '../../../../test/enviroment.test.json';
import publicProviderServiceStub from '../publicProvider/public-provider-service-stub';
import { WEENUS } from '../../../../test/tokens/eth-tokens';
import {
  UniSwapContractAbi,
  UniSwapContractAddress
} from '../../instant-trade/uni-swap-service/uni-swap-contract';

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
      let getWeb3Public: () => Web3Public = () => service[blockchainName];

      it('get balance works', async done => {
        const balance = await getWeb3Public().getBalance(aliceAddress);
        expect(balance).not.toBe(undefined);
        expect(balance.gt(0)).toBeTruthy();
        done();
      });

      it('balance of works (tokens)', async done => {
        const balance = await getWeb3Public().getTokenBalance(WEENUS.address, aliceAddress);
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
    });
  }
});
