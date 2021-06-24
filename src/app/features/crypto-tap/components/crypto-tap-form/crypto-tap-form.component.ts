import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { blockchainsList } from 'src/app/features/swaps/constants/BlockchainsList';
import { FromToAvailableTokens } from 'src/app/features/crypto-tap/models/FromToAvailableTokens';
import { CryptoTapTokensService } from 'src/app/features/crypto-tap/services/crypto-tap-tokens-service/crypto-tap-tokens.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-crypto-tap-form',
  templateUrl: './crypto-tap-form.component.html',
  styleUrls: ['./crypto-tap-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoTapFormComponent implements OnInit, OnDestroy {
  public isLoading = true;

  public $tokensSubscription: Subscription;

  public blockchainsListFrom = blockchainsList.filter(
    blockchain => blockchain.symbol === BLOCKCHAIN_NAME.ETHEREUM
  );

  public blockchainsListTo = blockchainsList.filter(
    blockchain =>
      blockchain.symbol === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ||
      blockchain.symbol === BLOCKCHAIN_NAME.POLYGON
  );

  public availableTokens: FromToAvailableTokens = {
    from: [],
    to: []
  };

  constructor(
    private cdr: ChangeDetectorRef,
    public cryptoTapFormService: CryptoTapFormService,
    private cryptoTapTokenService: CryptoTapTokensService
  ) {}

  ngOnInit(): void {
    this.$tokensSubscription = this.cryptoTapTokenService.availableTokens$.subscribe(tokens => {
      if (!tokens.from?.length) {
        return;
      }
      this.availableTokens = tokens;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.$tokensSubscription.unsubscribe();
  }
}
