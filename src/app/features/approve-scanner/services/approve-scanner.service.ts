import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { Blockchain, BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { BLOCKCHAIN_NAME, ERC20_TOKEN_ABI, MethodDecoder } from 'rubic-sdk';
import { FormControl, FormGroup } from '@angular/forms';
import { FormControlType } from '@shared/models/utils/angular-forms-types';
import { SupportedBlockchain, supportedBlockchains } from '../constants/supported-blockchains';
import { combineLatestWith, map, Observable, startWith, switchMap } from 'rxjs';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HttpClient } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RevokeModalComponent } from '@features/approve-scanner/components/revoke-modal/revoke-modal.component';

interface ApproveForm {
  blockchain: Blockchain;
  searchQuery: string;
}

interface Test {
  hash: string;
  tokenAddress: string;
  spender: string;
  value: string;
}

type ApproveFormControl = FormControlType<ApproveForm>;

@Injectable()
export class ApproveScannerService {
  public readonly supportedBlockchains = Object.entries(BLOCKCHAINS)
    .filter(([blockchain]: [SupportedBlockchain, Blockchain]) =>
      supportedBlockchains.includes(blockchain)
    )
    .map(([_blockchain, meta]) => meta);

  private readonly defaultBlockchain = this.supportedBlockchains.find(
    blockchain => blockchain.key === BLOCKCHAIN_NAME.ETHEREUM
  );

  public readonly form = new FormGroup<ApproveFormControl>({
    blockchain: new FormControl(this.defaultBlockchain),
    searchQuery: new FormControl(null)
  });

  public readonly allApproves$ = this.form.controls.blockchain.valueChanges.pipe(
    startWith(this.defaultBlockchain),
    switchMap(blockchain => this.fetchTransactions(blockchain))
  );

  public readonly visibleApproves$ = this.allApproves$.pipe(
    combineLatestWith(
      this.form.controls.searchQuery.valueChanges.pipe(startWith(null), debounceTime(100))
    ),
    map(([approves, searchQuery]) =>
      searchQuery
        ? approves.filter(tx => {
            const spender = tx.spender.toLowerCase();
            const token = tx.tokenAddress.toLowerCase();
            const txHash = tx.hash.toLowerCase();
            const queryString = searchQuery.toLowerCase();

            return (
              spender.includes(queryString) ||
              token.includes(queryString) ||
              txHash.includes(queryString)
            );
          })
        : approves
    )
  );

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpService: HttpClient,
    @Inject(INJECTOR) private readonly injector: Injector,
    private readonly dialogService: TuiDialogService
  ) {}

  private fetchTransactions(blockchain: Blockchain): Observable<Test[]> {
    const userAddress = this.walletConnectorService.address;
    const blockchainAddressMapper: Record<SupportedBlockchain, string> = {
      [BLOCKCHAIN_NAME.ETHEREUM]: `https://api.etherscan.io/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: `https://api.bscscan.com/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.POLYGON]: `https://api.polygonscan.com/api?module=account&action=txlist&address=${userAddress}`
    };
    return this.httpService
      .get<{ result: { hash: string; functionName: string; to: string; input: string }[] }>(
        blockchainAddressMapper[blockchain.key as SupportedBlockchain]
      )
      .pipe(
        map(response => {
          const approveTransactions = response.result.filter(tx =>
            tx?.functionName.includes('approve')
          );
          return approveTransactions.map(tx => {
            const decodedData = MethodDecoder.decodeMethod(
              ERC20_TOKEN_ABI.find(method => method.name === 'approve')!,
              tx.input
            );
            const spender = decodedData.params.find(param => param.name === '_spender')!.value;
            const value = decodedData.params.find(param => param.name === '_value')!.value;
            return { hash: tx.hash, tokenAddress: tx.to, spender, value };
          });
        })
        // switchMap(approves => {
        //   const multicallData = approves.map(approve => ({
        //     contractAddress: approve.tokenAddress,
        //     methodsData: {
        //       methodName: 'allowance',
        //       methodArguments: [userAddress, ]
        //     }
        //   }));
        //   Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ETHEREUM).multicallContractsMethods(ERC20_TOKEN_ABI, multicallData))
        // })
      );
  }

  public async revokeApprove(token: string, spender: string): Promise<void> {
    this.dialogService
      .open(new PolymorpheusComponent(RevokeModalComponent, this.injector), {
        size: 'm',
        data: {
          tokenAddress: token,
          spenderAddress: spender,
          blockchain: this.form.controls.blockchain.value.key
        }
      })
      .subscribe();
    // const blockchain = this.form.controls.blockchain.value.key as EvmBlockchainName;
    // const allowance = await Injector.web3PublicService
    //   .getWeb3Public(blockchain)
    //   .getAllowance(token, this.walletConnectorService.address, spender);
    // if (allowance.eq(0)) {
    //   throw new RubicSdkError('Approve already revoked, token has 0 allowance');
    // }
    // await Injector.web3PrivateService
    //   .getWeb3PrivateByBlockchain(blockchain)
    //   .approveTokens(token, spender, new BigNumber(0), {});
  }
}
