import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import {
  CLEARSWAP_STATUS,
  CLEARSWAP_SUB_STATUS
} from '@app/features/privacy/providers/clearswap/models/status';

@Injectable({
  providedIn: 'root'
})
export class TradeStatusService {
  constructor(private readonly httpService: HttpService) {}

  public getClearswapStatus(
    id: string
  ): Promise<{ status: CLEARSWAP_STATUS; subStatus: CLEARSWAP_SUB_STATUS; destTxHash: string }> {
    return firstValueFrom(
      this.httpService.get(`v3/internal/statuses/clearswap/status?rubic_id=${id}`)
    );
  }
}
