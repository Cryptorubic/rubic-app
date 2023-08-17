import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME, CHAIN_TYPE, Injector } from 'rubic-sdk';
import { airdropContractAbi } from '@features/swap-and-earn/constants/airdrop/airdrop-contract-abi';
import { airdropContractAddress } from '@features/swap-and-earn/constants/airdrop/airdrop-contract-address';
import { AirdropNode } from '@features/swap-and-earn/models/airdrop-node';
import { newRubicToken } from '@features/swap-and-earn/constants/airdrop/airdrop-token';
import { GasService } from '@core/services/gas-service/gas.service';
import { retrodropContractAddress } from '@features/swap-and-earn/constants/retrodrop/retrodrop-contract-address';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';

@Injectable()
export class SwapAndEarnWeb3Service {
  private readonly contractAddress =
    this.swapAndEarnStateService.currentTab === 'airdrop'
      ? airdropContractAddress
      : retrodropContractAddress;

  constructor(
    private readonly gasService: GasService,
    private readonly swapAndEarnStateService: SwapAndEarnStateService
  ) {}

  public async executeClaim(
    node: AirdropNode,
    proof: string[],
    onTransactionHash: (hash: string) => void
  ): Promise<void> {
    const web3 = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);
    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      BLOCKCHAIN_NAME.ARBITRUM
    );

    await web3.tryExecuteContractMethod(
      this.contractAddress,
      airdropContractAbi,
      'claim',
      [node.index, node.account, node.amount, proof],
      {
        onTransactionHash,
        ...(shouldCalculateGasPrice && { gasPriceOptions })
      }
    );
  }

  public async checkPause(): Promise<void> {
    const isPaused = await Injector.web3PublicService
      .getWeb3Public(newRubicToken.blockchain)
      .callContractMethod(this.contractAddress, airdropContractAbi, 'paused', []);
    if (isPaused) {
      throw new Error('paused');
    }
  }

  public async checkClaimed(index: number): Promise<void> {
    const isPaused = await Injector.web3PublicService
      .getWeb3Public(newRubicToken.blockchain)
      .callContractMethod(this.contractAddress, airdropContractAbi, 'isClaimed', [index]);
    if (isPaused) {
      throw new Error('claimed');
    }
  }
}
