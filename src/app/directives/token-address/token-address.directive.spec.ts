import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TokenAddressDirective } from './token-address.directive';
import { MetamaskProviderService } from '../../services/blockchain/private-provider/metamask-provider/metamask-provider.service';
import providerServiceStub from '../../services/blockchain/private-provider/metamask-provider/metamask-provider.service.stub';
import { Web3PublicService } from '../../services/blockchain/web3-public-service/web3-public.service';

describe('TokenAddressDirective', () => {
  let service: Web3PublicService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        { provide: MetamaskProviderService, useValue: providerServiceStub() }
      ]
    });
    service = TestBed.get(Web3PublicService);
  });

  it('should create an instance', () => {
    const directive = new TokenAddressDirective(service);

    expect(directive).toBeTruthy();
  });
});
