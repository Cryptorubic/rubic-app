import { Injectable } from '@angular/core';
import { GasRefundApiService } from '@core/services/backend/gas-refund-api/gas-refund-api.service';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Promotion } from '@features/my-trades/models/promotion';
import { AuthService } from '@core/services/auth/auth.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { soliditySha3 } from 'web3-utils';
import BigNumber from 'bignumber.js';
import { MerkleTree } from 'merkletreejs';
import { RootData } from '@features/my-trades/models/root-data';
import { REFUND_ABI } from '@features/my-trades/constants/refund-abi';
import { UnknownError } from '@core/errors/models/unknown.error';
import { TransactionReceipt } from 'web3-eth';
import { REFUND_ADDRESS } from '@features/my-trades/constants/refund-address';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { mapToVoid } from '@shared/utils/utils';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';

@Injectable()
export class GasRefundService {
  public readonly userPromotions$: Observable<Promotion[]>;

  private refundBlockchain = REFUND_ADDRESS.blockchain;

  private readonly refundContractAbi = REFUND_ABI;

  private refundContractAddress = REFUND_ADDRESS.address;

  private readonly _userPromotions$ = new BehaviorSubject<Promotion[]>([]);

  public get userPromotions(): Promotion[] {
    return this._userPromotions$.getValue();
  }

  constructor(
    private readonly gasRefundApiService: GasRefundApiService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.userPromotions$ = this._userPromotions$.asObservable();
    this.setUpdatePromotionsSubscription();
  }

  /**
   * Specific hash function based on keccak256. Hashes similarly to functions from a merkle contract.
   * @param arg two values to hash. Each value takes 32 byte.
   */
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

  /**
   * Subscribes to user changes and updates promotions when it emits.
   */
  private setUpdatePromotionsSubscription(): void {
    this.authService
      .getCurrentUser()
      .pipe(filter(user => !!user?.address))
      .subscribe(() => this.updateUserPromotions());
  }

  /**
   * Fetches actual user promotions list, updates promotions storage, then emits void and completes stream.
   */
  public updateUserPromotions(): Observable<void> {
    const userPromotions$ = this.gasRefundApiService.getUserPromotions();
    const comparator = (a: Promotion, b: Promotion) =>
      a.refundDate.valueOf() - b.refundDate.valueOf();

    userPromotions$
      .pipe(map(promotions => [...promotions].sort(comparator)))
      .subscribe(promotions => this._userPromotions$.next(promotions));

    return userPromotions$.pipe(mapToVoid());
  }

  /**
   * Calculates the proof for a refund, sends a refund transaction. If successful, notifies the backend of a successful refund.
   * @param promotionId promotion id to refund.
   * @param onTransactionHash a function to be called after sending a refund transaction.
   * @return stream that emits the transaction hash once and completes.
   */
  public refund(
    promotionId: number,
    onTransactionHash?: (hash: string) => void
  ): Observable<string> {
    const address = this.authService.userAddress;
    return from(this.checkChain()).pipe(
      filter(success => success),
      switchMap(() => this.gasRefundApiService.getPromotionMerkleData(promotionId)),
      switchMap(({ leaves, rootIndex, amount }) => {
        // leaf is keccak256(abi.encodePacked(address, weiAmount))
        const leaf = soliditySha3(address, amount.toFixed(0));

        const tree = new MerkleTree(leaves, GasRefundService.merkleKeccak256);
        const root = `0x${tree.getRoot().toString('hex')}`;
        const proof = tree.getHexProof(leaf);

        return from(this.sendRefund(proof, amount, { root, rootIndex }, onTransactionHash)).pipe(
          map(receipt => ({ txHash: receipt.transactionHash, leaf }))
        );
      }),
      switchMap(({ txHash, leaf }) => {
        return this.gasRefundApiService.markPromotionAsUsed(txHash, leaf).pipe(map(() => txHash));
      })
    );
  }

  /**
   * Checks the network selected in the wallet for compliance with the contract network, and switches the network if necessary.
   * @return is the correct network selected as a result.
   */
  private checkChain(): Promise<boolean> {
    if (this.walletConnectorService.networkName !== this.refundBlockchain) {
      return this.walletConnectorService.switchChain(this.refundBlockchain);
    }
    return Promise.resolve(true);
  }

  /**
   * Safely calls the contract method to refund gas.
   * @param proof merkle tree proof.
   * @param amount BRBC amount to refund in wei.
   * @param rootData root index and root hash.
   * @param onTransactionHash  a function to be called after sending a refund transaction.
   * @return refund promise resolved by transaction receipt.
   */
  private async sendRefund(
    proof: string[],
    amount: BigNumber,
    rootData: RootData,
    onTransactionHash?: (hash: string) => void
  ): Promise<TransactionReceipt> {
    const address = this.authService.userAddress;
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(this.refundBlockchain);
    const hexRootFromContract = await blockchainAdapter.callContractMethod(
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

    return Injector.web3Private.tryExecuteContractMethod(
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
