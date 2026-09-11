import { Injectable } from '@angular/core';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';

@Injectable()
export class DepositStatusService {
  constructor(private readonly rubicApiService: RubicApiService) {}
}
