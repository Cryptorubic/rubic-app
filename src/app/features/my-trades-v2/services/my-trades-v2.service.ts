import { Injectable } from '@angular/core';
import { MyTradesStoreService } from '@app/shared/services/my-trades-store.service';

@Injectable()
export class MyTradesV2Service {
  constructor(private readonly myTradesStoreService: MyTradesStoreService) {}
}
