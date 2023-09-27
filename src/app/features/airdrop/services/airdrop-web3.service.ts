import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME, CHAIN_TYPE, Injector } from 'rubic-sdk';
import { airdropContractAbi } from '@features/airdrop/constants/airdrop/airdrop-contract-abi';
import { AirdropNode } from '@features/airdrop/models/airdrop-node';
import { newRubicToken } from '@features/airdrop/constants/airdrop/airdrop-token';
import { GasService } from '@core/services/gas-service/gas.service';

@Injectable({ providedIn: 'root' })
export class AirdropWeb3Service {
  constructor(private readonly gasService: GasService) {}

  public async executeClaim(
    contractAddress: string,
    node: AirdropNode,
    proof: string[],
    onTransactionHash: (hash: string) => void
  ): Promise<void> {
    const web3 = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);
    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      BLOCKCHAIN_NAME.ARBITRUM
    );

    await web3.tryExecuteContractMethod(
      contractAddress,
      airdropContractAbi,
      'claim',
      [node.index, node.account, node.amount, proof],
      {
        onTransactionHash,
        ...(shouldCalculateGasPrice && { gasPriceOptions })
      }
    );
  }

  public async checkPause(contractAddress: string): Promise<void> {
    const isPaused = await Injector.web3PublicService
      .getWeb3Public(newRubicToken.blockchain)
      .callContractMethod(contractAddress, airdropContractAbi, 'paused', []);
    if (isPaused) {
      throw new Error('paused');
    }
  }

  public async checkClaimed(contractAddress: string, index: number): Promise<void> {
    const isPaused = await Injector.web3PublicService
      .getWeb3Public(newRubicToken.blockchain)
      .callContractMethod(contractAddress, airdropContractAbi, 'isClaimed', [index]);
    if (isPaused) {
      throw new Error('claimed');
    }
  }
}
