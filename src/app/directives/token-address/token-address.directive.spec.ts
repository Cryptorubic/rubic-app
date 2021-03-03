import { TokenAddressDirective } from './token-address.directive';
import { Web3ApiService } from '../../services/web3Api/web3-api.service';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ProviderService } from '../../services/provider/provider.service';
import providerServiceStub from '../../services/provider/provider-service-stub';

describe('TokenAddressDirective', () => {
  let service: Web3ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        { provide: ProviderService, useValue: providerServiceStub() }
      ]
    });
    service = TestBed.get(Web3ApiService);
  });

  it('should create an instance', () => {
    const directive = new TokenAddressDirective(service);
    expect(directive).toBeTruthy();
  });
});
