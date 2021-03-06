import { TokenAddressDirective } from './token-address.directive';
import { Web3PrivateService } from '../../services/blockchain/web3-private-service/web3-private.service';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MetamaskProviderService } from '../../services/blockchain/private-provider/metamask-provider/metamask-provider.service';
import providerServiceStub from '../../services/blockchain/private-provider/metamask-provider/metamask-provider.service.stub';

describe('TokenAddressDirective', () => {
  let service: Web3PrivateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        { provide: MetamaskProviderService, useValue: providerServiceStub() }
      ]
    });
    service = TestBed.get(Web3PrivateService);
  });

  it('should create an instance', () => {
    const directive = new TokenAddressDirective(service);
    expect(directive).toBeTruthy();
  });
});
