import { Injectable } from '@angular/core';
import { RubicSdkService } from '@app/features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';

@Injectable({
  providedIn: 'root'
})
export class SdkLoaderService {
  constructor(private readonly sdkService: RubicSdkService) {}

  public async initSdk(): Promise<void> {
    await this.sdkService.initSDK();
  }
}
