import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UndefinedErrorComponent } from 'src/app/core/errors/components/undefined-error/undefined-error.component';
import { UnknownErrorComponent } from 'src/app/core/errors/components/unknown-error/unknown-error.component';
import { TuiManualHintModule } from '@taiga-ui/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { NotSupportedNetworkErrorComponent } from './components/not-supported-network-error/not-supported-network-error.component';
import { InsufficientFundsErrorComponent } from './components/insufficient-funds-error/insufficient-funds-error.component';
import { MetamaskErrorComponent } from './components/metamask-error/metamask-error.component';
import { NetworkErrorComponent } from './components/network-error/network-error.component';
import { TotalSupplyOverflowErrorComponent } from './components/total-supply-overflow-error/total-supply-overflow-error.component';
import { OverQueryLimitErrorComponent } from './components/over-query-limit-error/over-query-limit-error.component';
import { MaxGasPriceOverflowErrorComponent } from './components/max-gas-price-overflow-error/max-gas-price-overflow-error.component';
import { InsufficientFundsCcrErrorComponent } from './components/insufficient-funds-ccr-error/insufficient-funds-ccr-error.component';

@NgModule({
  declarations: [
    UndefinedErrorComponent,
    NotSupportedNetworkErrorComponent,
    InsufficientFundsErrorComponent,
    MetamaskErrorComponent,
    NetworkErrorComponent,
    TotalSupplyOverflowErrorComponent,
    OverQueryLimitErrorComponent,
    MaxGasPriceOverflowErrorComponent,
    UnknownErrorComponent,
    InsufficientFundsCcrErrorComponent
  ],
  imports: [CommonModule, TranslateModule, InlineSVGModule, TuiManualHintModule],
  entryComponents: [
    UndefinedErrorComponent,
    NotSupportedNetworkErrorComponent,
    InsufficientFundsErrorComponent,
    MetamaskErrorComponent,
    NetworkErrorComponent,
    TotalSupplyOverflowErrorComponent,
    OverQueryLimitErrorComponent,
    UnknownErrorComponent,
    InsufficientFundsCcrErrorComponent
  ]
})
export class ErrorsModule {}
