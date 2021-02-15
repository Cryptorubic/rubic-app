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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ Web3ApiService, { provide: ProviderService, useValue: providerServiceStub() }],
      imports: [ HttpClientModule ]
    });
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

    service = TestBed.get(UniSwapService);
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
    console.log(JSON.stringify(trade));
    expect(trade).toBeTruthy();
    expect(trade.to.amount.gt(0)).toBeTruthy();
    done();
  });

});
