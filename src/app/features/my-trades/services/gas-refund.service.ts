import { Injectable } from '@angular/core';
import { GasRefundApiService } from 'src/app/core/services/backend/gas-refund-api/gas-refund-api.service';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Promotion } from 'src/app/features/my-trades/models/promotion';
import { tuiPure } from '@taiga-ui/cdk';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { filter, map, mergeMap } from 'rxjs/operators';
import { mapToVoid, switchTap } from 'src/app/shared/utils/utils';
import { soliditySha3 } from 'web3-utils';
import BigNumber from 'bignumber.js';
import { MerkleTree } from 'merkletreejs';
import { RootData } from 'src/app/features/my-trades/models/root-data';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { REFUND_ABI } from 'src/app/features/my-trades/constants/REFUND_ABI';
import { UnknownError } from 'src/app/core/errors/models/unknown.error';
import { TransactionReceipt } from 'web3-eth';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import {
  REFUND_ADDRESS,
  REFUND_ADDRESS_TESTNET
} from 'src/app/features/my-trades/constants/REFUND_ADDRESS';

@Injectable()
export class GasRefundService {
  private refundBlockchain = REFUND_ADDRESS.blockchain;

  private refundContractAbi = REFUND_ABI;

  private refundContractAddress = REFUND_ADDRESS.address;

  private _userPromotions$ = new BehaviorSubject<Promotion[]>([]);

  @tuiPure
  public get userPromotions$(): Observable<Promotion[]> {
    return this._userPromotions$.asObservable();
  }

  public get userPromotions(): Promotion[] {
    return this._userPromotions$.getValue();
  }

  constructor(
    private readonly gasRefundApiService: GasRefundApiService,
    private readonly authService: AuthService,
    private readonly web3Private: Web3PrivateService,
    private readonly web3Public: Web3PublicService,
    private readonly providerConnector: ProviderConnectorService,
    private readonly testingModeService: UseTestingModeService
  ) {
    authService
      .getCurrentUser()
      .pipe(filter(user => !!user?.address))
      .subscribe(() => this.updateUserPromotions());

    this.updateUserPromotions();
    this.setupTestingMode();
  }

  private static merkleKeccak256(arg: Uint8Array): string {
    const first = `0x${(<Buffer>arg).toString('hex').slice(0, 64)}`;

    const second = `0x${(<Buffer>arg).toString('hex').slice(64)}`;
    let res;

    if (new BigNumber(first).lt(second)) {
      res = soliditySha3(first, second);
    } else {
      res = soliditySha3(second, first);
    }

    return res.slice(2);
  }

  private setupTestingMode(): void {
    this.testingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.refundBlockchain = REFUND_ADDRESS_TESTNET.blockchain;
        this.refundContractAddress = REFUND_ADDRESS_TESTNET.address;
      }
    });
  }

  public updateUserPromotions(): Observable<void> {
    const userPromotions$ = this.gasRefundApiService.getUserPromotions();
    userPromotions$.subscribe(promotions => this._userPromotions$.next(promotions));

    return userPromotions$.pipe(mapToVoid());
  }

  public refund(
    promotionId: number,
    onTransactionHash?: (hash: string) => void
  ): Observable<string> {
    this.gasRefundApiService.markPromotionAsUsed(promotionId).subscribe();
    const address = this.authService.userAddress;
    return from(this.checkChain()).pipe(
      filter(success => success),
      mergeMap(() => this.gasRefundApiService.getPromotionMerkleData(promotionId)),
      mergeMap(({ leaves, rootIndex, amount }) => {
        // leaf is keccak256(abi.encodePacked(address, weiAmount))
        const leaf = soliditySha3(address, amount.toFixed(0));

        const tree = new MerkleTree(leaves, GasRefundService.merkleKeccak256);
        const root = `0x${tree.getRoot().toString('hex')}`;
        const proof = tree.getHexProof(leaf);

        return from(this.sendRefund(proof, amount, { root, rootIndex }, onTransactionHash)).pipe(
          map(receipt => receipt.transactionHash)
        );
      }),
      switchTap(() => this.gasRefundApiService.markPromotionAsUsed(promotionId))
    );
  }

  private checkChain(): Promise<boolean> {
    if (this.providerConnector.networkName !== this.refundBlockchain) {
      return this.providerConnector.switchChain(this.refundBlockchain);
    }
    return Promise.resolve(true);
  }

  private async sendRefund(
    proof: string[],
    amount: BigNumber,
    rootData: RootData,
    onTransactionHash?: (hash: string) => void
  ): Promise<TransactionReceipt> {
    const address = this.authService.userAddress;
    const web3Public = this.web3Public[this.refundBlockchain];
    const hexRootFromContract = await web3Public.callContractMethod(
      this.refundContractAddress,
      this.refundContractAbi,
      'merkleRoots',
      { methodArguments: [rootData.rootIndex] }
    );

    if (hexRootFromContract !== rootData.root) {
      throw new UnknownError(
        `Roots are not equal: expected ${rootData.root} but got ${hexRootFromContract}`
      );
    }

    return this.web3Private.tryExecuteContractMethod(
      this.refundContractAddress,
      this.refundContractAbi,
      'getTokensByMerkleProof',
      [proof, address, amount.toFixed(0), rootData.rootIndex],
      {
        onTransactionHash
      }
    );
  }
}
