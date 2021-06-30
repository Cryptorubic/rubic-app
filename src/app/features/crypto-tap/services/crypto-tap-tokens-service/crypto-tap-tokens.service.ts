import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { CryptoTapToken } from 'src/app/features/crypto-tap/models/CryptoTapToken';
import { FromToAvailableTokens } from 'src/app/features/crypto-tap/models/FromToAvailableTokens';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { HttpClient } from '@angular/common/http';

interface BackendTokensResponse {
  '1': { address?: string }[];
  '3': { address?: string }[];
}

@Injectable()
export class CryptoTapTokensService {
  private baseApiUrl = 'https://exchanger.rubic.exchange/api/v1/';

  private _cryptoTapTokens$ = new BehaviorSubject<CryptoTapToken[]>([]);

  private _availableTokens$ = new BehaviorSubject<FromToAvailableTokens>({
    from: [],
    to: []
  });

  public get availableTokens$(): Observable<FromToAvailableTokens> {
    return this._availableTokens$.asObservable();
  }

  public get availableTokens(): FromToAvailableTokens {
    return this._availableTokens$.getValue();
  }

  private isTestingMode = false;

  constructor(
    private tokensService: TokensService,
    private httpClient: HttpClient,
    private cryptoTapFormService: CryptoTapFormService,
    private web3PublicService: Web3PublicService,
    useTestingModeService: UseTestingModeService
  ) {
    this.loadCryptoTapTokens();
    this.setUpTokens();

    useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.isTestingMode = true;
        this.baseApiUrl = 'https://devbnbexchange.mywish.io/api/v1/';
        this.loadCryptoTapTokens();
      }
    });
  }

  private loadCryptoTapTokens() {
    this.httpClient
      .get(`${this.baseApiUrl}tokens/`)
      .subscribe((response: BackendTokensResponse) => {
        const tokens: CryptoTapToken[] = [];
        Object.entries(response).forEach(([key, value]) =>
          tokens.push(
            ...value.map(token => ({
              address:
                token.address ||
                this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM].nativeTokenAddress,
              // eslint-disable-next-line eqeqeq
              direction: key == '1' ? BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN : BLOCKCHAIN_NAME.POLYGON
            }))
          )
        );

        this._cryptoTapTokens$.next(tokens);
      });
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
                .find(
                  token => token.address.toLowerCase() === cryptoTapToken.address.toLowerCase()
                ),
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
