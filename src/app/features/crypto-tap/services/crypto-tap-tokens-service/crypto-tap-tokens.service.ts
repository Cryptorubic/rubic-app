import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { CryptoTapToken } from 'src/app/features/crypto-tap/models/CryptoTapToken';
import { FromToAvailableTokens } from 'src/app/features/crypto-tap/models/FromToAvailableTokens';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';

@Injectable()
export class CryptoTapTokensService {
  private _cryptoTapTokens$ = new BehaviorSubject<CryptoTapToken[]>([]);

  private _availableTokens$ = new BehaviorSubject<FromToAvailableTokens>({
    from: [],
    to: []
  });

  public get availableTokens$(): Observable<FromToAvailableTokens> {
    return this._availableTokens$.asObservable();
  }

  constructor(
    private tokensService: TokensService,
    private cryptoTapFormService: CryptoTapFormService,
    private web3PublicService: Web3PublicService
  ) {
    this.loadCryptoTapTokens();
    this.setUpTokens();
  }

  private loadCryptoTapTokens() {
    setTimeout(() => {
      this._cryptoTapTokens$.next([
        {
          address: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
          direction: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        },
        {
          address: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
          direction: BLOCKCHAIN_NAME.POLYGON
        },
        {
          address: '0x0000000000000000000000000000000000000000',
          direction: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        },
        {
          address: '0x0000000000000000000000000000000000000000',
          direction: BLOCKCHAIN_NAME.POLYGON
        }
      ]);
    }, 2000);
  }

  private setUpTokens() {
    const supprotedToBlockchains = [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN, BLOCKCHAIN_NAME.POLYGON];

    combineLatest([this.tokensService.tokens, this._cryptoTapTokens$.asObservable()]).subscribe(
      ([tokens, cryptoTapTokens]) => {
        if (!tokens?.size || !cryptoTapTokens?.length) {
          return;
        }
        const { toBlockchain } = this.cryptoTapFormService.commonTrade.controls.input.value;
        const availableTokens: FromToAvailableTokens = {
          from: cryptoTapTokens
            .filter(cryptoTapToken => cryptoTapToken.direction === toBlockchain)
            .map(cryptoTapToken => ({
              ...tokens
                .filter(token => token.blockchain === BLOCKCHAIN_NAME.ETHEREUM)
                .find(token => token.address === cryptoTapToken.address),
              available: true
            })),
          to: tokens
            .filter(
              token =>
                supprotedToBlockchains.includes(token.blockchain) &&
                (this.web3PublicService[token.blockchain] as Web3Public)?.isNativeAddress(
                  token.address
                )
            )
            .map(token => ({ ...token, available: true }))
            .toArray()
        };

        this._availableTokens$.next(availableTokens);
      }
    );
  }
}
