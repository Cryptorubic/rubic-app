import { Injectable } from '@angular/core';
import { MetamaskError } from 'src/app/shared/models/errors/provider/MetamaskError';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { NetworkErrorComponent } from 'src/app/shared/components/network-error/network-error.component';
import { TotalSupplyOverflowError } from 'src/app/shared/models/errors/order-book/TotalSupplyOverflowError';
import { TotalSupplyOverflowErrorComponent } from 'src/app/shared/components/errors/total-supply-overflow-error/total-supply-overflow-error.component';
import { MessageBoxComponent } from 'src/app/shared/components/message-box/message-box.component';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  constructor(private readonly translateService: TranslateService) {}

  public showErrorDialog(err, dialog: MatDialog) {
    if (!(err instanceof RubicError)) {
      err = new RubicError(this.translateService);
    }
    let data: any = { title: 'Error', descriptionText: err.comment };
    if (err instanceof MetamaskError) {
      data.title = 'Warning';
    }
    if (err instanceof NetworkError) {
      data = {
        title: 'Error',
        descriptionComponentClass: NetworkErrorComponent,
        descriptionComponentInputs: { networkError: err }
      };
    }
    if (err instanceof TotalSupplyOverflowError) {
      data = {
        title: 'Error',
        descriptionComponentClass: TotalSupplyOverflowErrorComponent,
        descriptionComponentInputs: { totalSupplyOverflowError: err }
      };
    }
    dialog.open(MessageBoxComponent, {
      width: '400px',
      data
    });
  }
}
