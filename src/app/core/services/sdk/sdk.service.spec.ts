// Straight Jasmine testing without Angular's testing support
import { SdkService } from '@core/services/sdk/sdk.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

describe('SdkService', () => {
  let service: SdkService;
  let httpService: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    httpService = TestBed.inject(HttpClient);
    service = new SdkService(httpService, undefined, undefined, undefined);
  });

  it('#constructor should initiate SDK as null', () => {
    expect((service as RubicAny)._SDK).toBeNull();
  });

  it('#getConfig should return default config', () => {
    const defaultProvidersAddresses = {
      crossChain: '0x3fFF9bDEb3147cE13A7FFEf85Dae81874E0AEDbE',
      onChain: '0x3b9Ce17A7bD729A0abc5976bEAb6D7d150fbD0d4'
    };
    const config = service.getConfig({});

    expect(config.providerAddress.EVM.onChain).toBe(defaultProvidersAddresses.onChain);
    expect(config.providerAddress.EVM.crossChain).toBe(defaultProvidersAddresses.crossChain);
  });
});
