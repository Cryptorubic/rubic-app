/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { QueryParamsService } from './query-params.service';

describe('Service: QueryParams', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QueryParamsService]
    });
  });

  it('should ...', inject([QueryParamsService], (service: QueryParamsService) => {
    expect(service).toBeTruthy();
  }));
});
