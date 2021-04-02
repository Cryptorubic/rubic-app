import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicModule } from 'ng-dynamic-component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { InlineSVGModule } from 'ng-inline-svg';
import { FooterComponent } from './components/footer/footer.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ArrowComponent } from './components/arrow/arrow.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';
import { InfoTooltipComponent } from './components/info-tooltip/info-tooltip.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { BlockchainLabelComponent } from './components/blockchains-input/blockchain-label/blockchain-label.component';
import { BlockchainsInputComponent } from './components/blockchains-input/blockchains-input.component';
import { CollaborationsComponent } from './components/collaborations/collaborations.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { DisclaimerComponent } from './components/disclaimer/disclaimer.component';
import { DropdownSelectComponent } from './components/dropdown-select/dropdown-select.component';
import { InputDropdownComponent } from './components/input-dropdown/input-dropdown.component';
import { ModalComponent } from './components/modal/modal.component';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { TokenLabelComponent } from './components/tokens-input/token-label/token-label.component';
import { TokensInputComponent } from './components/tokens-input/tokens-input.component';
import { WhiteButtonComponent } from './components/white-button/white-button.component';
import { BigNumberFormat } from './pipes/big-number-format.pipe';
import { NativeUrlPipe } from './pipes/native-url.pipe';
import { ScannerLinkPipe } from './pipes/scanner-link.pipe';
import { AddressInputComponent } from './components/address-input/address-input.component';
import { WarningLabelComponent } from './components/warning-label/warning-label.component';
import { TokenAddressDirective } from './directives/token-address/token-address.directive';
import { NumberPrecisionDirective } from './directives/number-precision/number-precision.directive';
import { ScannerLinkComponent } from './components/scanner-link/scanner-link.component';
import { CoinsFilterComponent } from './components/coins-filter/coins-filter.component';
import { TokensCellComponent } from './components/tokens-cell/tokens-cell.component';
import { VolumeCellComponent } from './components/volume-cell/volume-cell.component';
import { VolumeBlockComponent } from './components/volume-block/volume-block.component';
import { ListingRequestPopupComponent } from './components/collaborations/listing-request-popup/listing-request-popup.component';
import { DisclaimerTextComponent } from './components/disclaimer-text/disclaimer-text.component';
import { TokensTableComponent } from './components/tokens-table/tokens-table.component';
import { TokensAccordionComponent } from './components/tokens-table/components/tokens-accordion/tokens-accordion.component';
import { TokensMobileHeaderComponent } from './components/tokens-table/components/tokens-mobile-header/tokens-mobile-header.component';

@NgModule({
  declarations: [
    FooterComponent,
    SpinnerComponent,
    ArrowComponent,
    MessageBoxComponent,
    InfoTooltipComponent,
    TooltipComponent,
    CountdownComponent,
    DisclaimerComponent,
    ModalComponent,
    PrimaryButtonComponent,
    TokensInputComponent,
    CollaborationsComponent,
    DropdownSelectComponent,
    WhiteButtonComponent,
    TokenLabelComponent,
    InputDropdownComponent,
    BlockchainsInputComponent,
    BlockchainLabelComponent,
    BigNumberFormat,
    ScannerLinkPipe,
    NativeUrlPipe,
    AddressInputComponent,
    WarningLabelComponent,
    TokenAddressDirective,
    NumberPrecisionDirective,
    ScannerLinkComponent,
    CoinsFilterComponent,
    TokensCellComponent,
    VolumeCellComponent,
    VolumeBlockComponent,
    ListingRequestPopupComponent,
    DisclaimerTextComponent,
    TokensTableComponent,
    TokensMobileHeaderComponent,
    TokensAccordionComponent
  ],
  entryComponents: [MessageBoxComponent],
  imports: [
    CommonModule,
    TranslateModule,
    DynamicModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatTableModule,
    MatSortModule,
    RouterModule,
    ScrollingModule,
    MatTooltipModule,
    MatSelectModule,
    InlineSVGModule.forRoot()
  ],
  exports: [
    FooterComponent,
    SpinnerComponent,
    ArrowComponent,
    MessageBoxComponent,
    InfoTooltipComponent,
    TooltipComponent,
    CountdownComponent,
    DisclaimerComponent,
    ModalComponent,
    PrimaryButtonComponent,
    TokensInputComponent,
    CollaborationsComponent,
    DropdownSelectComponent,
    WhiteButtonComponent,
    TokenLabelComponent,
    InputDropdownComponent,
    BlockchainsInputComponent,
    BlockchainLabelComponent,
    BigNumberFormat,
    ScannerLinkPipe,
    NativeUrlPipe,
    AddressInputComponent,
    WarningLabelComponent,
    TokenAddressDirective,
    TranslateModule,
    NumberPrecisionDirective,
    ScannerLinkComponent,
    CoinsFilterComponent,
    TokensCellComponent,
    VolumeCellComponent,
    VolumeBlockComponent,
    DisclaimerTextComponent,
    TokensTableComponent
  ]
})
export class SharedModule {}
