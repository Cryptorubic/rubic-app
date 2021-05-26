import { Injectable } from '@angular/core';
import { MetamaskError } from 'src/app/shared/models/errors/provider/MetamaskError';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { NetworkErrorComponent } from 'src/app/shared/components/network-error/network-error.component';
import { TotalSupplyOverflowError } from 'src/app/shared/models/errors/order-book/TotalSupplyOverflowError';
import { TotalSupplyOverflowErrorComponent } from 'src/app/shared/components/errors/total-supply-overflow-error/total-supply-overflow-error.component';
import { MessageBoxComponent } from 'src/app/shared/components/message-box/message-box.component';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { MatDialog } from '@angular/material/dialog';
import { Observable, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

type ErrorModalTitle = 'Error' | 'Warning';

interface ErrorData {
  title: ErrorModalTitle;
  [field: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  constructor(private dialog: MatDialog, private readonly translateService: TranslateService) {}

  public $throw(error: Error, message?: string): Observable<never> {
    console.error(message || error.message);
    return throwError(error);
  }

  public throw(error: Error, message?: string): void {
    console.error(message || error.message);
    throw error;
  }

  public showErrorDialog(err) {
    console.error(err);
    if (!(err instanceof RubicError)) {
      err = new RubicError();
    }
    let data: ErrorData = {
      title: 'Error',
      descriptionText: this.translateService.instant(err.translateKey) || err.message
    };
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
    data.title = this.translateService.instant(`common.${data.title}`);
    this.dialog.open(MessageBoxComponent, {
      width: '400px',
      data
    });
  }
}
