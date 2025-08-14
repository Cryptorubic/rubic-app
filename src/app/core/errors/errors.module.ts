import { TuiHintModule } from '@taiga-ui/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UndefinedErrorComponent } from 'src/app/core/errors/components/undefined-error/undefined-error.component';
import { UnknownErrorComponent } from 'src/app/core/errors/components/unknown-error/unknown-error.component';
import { SharedModule } from '@shared/shared.module';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NotSupportedNetworkErrorComponent } from './components/not-supported-network-error/not-supported-network-error.component';
import { InsufficientFundsErrorComponent } from './components/insufficient-funds-error/insufficient-funds-error.component';
import { MetamaskErrorComponent } from './components/metamask-error/metamask-error.component';
import { NetworkErrorComponent } from './components/network-error/network-error.component';
import { TotalSupplyOverflowErrorComponent } from './components/total-supply-overflow-error/total-supply-overflow-error.component';
import { OverQueryLimitErrorComponent } from './components/over-query-limit-error/over-query-limit-error.component';
import { MaxGasPriceOverflowErrorComponent } from './components/max-gas-price-overflow-error/max-gas-price-overflow-error.component';
import { InsufficientFundsCcrErrorComponent } from './components/insufficient-funds-ccr-error/insufficient-funds-ccr-error.component';
import { InsufficientFundsOneinchErrorComponent } from './components/insufficient-funds-oneinch-error/insufficient-funds-oneinch-error.component';
import { TokenWithFeeErrorComponent } from './components/token-with-fee-error/token-with-fee-error.component';
import { UnsupportedTokenCCRComponent } from 'src/app/core/errors/components/unsupported-token-ccr/unsupported-token-ccr.component';
import { RpcErrorComponent } from './components/rpc-error/rpc-error.component';
import { TransactionFailedErrorComponent } from '@core/errors/components/transaction-failed-error/transaction-failed-error.component';
import { BitKeepErrorComponent } from '@core/errors/components/bitkeep-error/bitkeep-error.component';
import { TokenPocketErrorComponent } from './components/token-pocket-error/token-pocket-error.component';
import { NoLinkedAccountErrorComponent } from './components/no-linked-account-error/no-linked-account-error.component';
import { CoinbaseErrorComponent } from './components/coinbase-error/coinbase-error.component';
import { SimulationFailedErrorComponent } from './components/simulation-failed-error/simulation-failed-error.component';

@NgModule({
  declarations: [
    UndefinedErrorComponent,
    NotSupportedNetworkErrorComponent,
    InsufficientFundsErrorComponent,
    MetamaskErrorComponent,
    BitKeepErrorComponent,
    NetworkErrorComponent,
    TotalSupplyOverflowErrorComponent,
    OverQueryLimitErrorComponent,
    MaxGasPriceOverflowErrorComponent,
    UnknownErrorComponent,
    InsufficientFundsCcrErrorComponent,
    InsufficientFundsOneinchErrorComponent,
    TokenWithFeeErrorComponent,
    UnsupportedTokenCCRComponent,
    RpcErrorComponent,
    TransactionFailedErrorComponent,
    TokenPocketErrorComponent,
    NoLinkedAccountErrorComponent,
    CoinbaseErrorComponent,
    SimulationFailedErrorComponent
  ],
  imports: [CommonModule, SharedModule, TranslateModule, InlineSVGModule, TuiHintModule]
})
export class ErrorsModule {}
