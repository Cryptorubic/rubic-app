import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME, CHAIN_TYPE, Injector } from 'rubic-sdk';
import { airdropContractAbi } from '@features/swap-and-earn/constants/airdrop/airdrop-contract-abi';
import { airdropContractAddress } from '@features/swap-and-earn/constants/airdrop/airdrop-contract-address';
import { AirdropNode } from '@features/swap-and-earn/models/airdrop-node';
import { newRubicToken } from '@features/swap-and-earn/constants/airdrop/airdrop-token';
import { GasService } from '@core/services/gas-service/gas.service';

@Injectable()
export class AirdropWeb3Service {
  private readonly airDropContractAddress = airdropContractAddress;

  constructor(private readonly gasService: GasService) {}

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
      this.airDropContractAddress,
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
      .callContractMethod(this.airDropContractAddress, airdropContractAbi, 'paused', []);
    if (isPaused) {
      throw new Error('paused');
    }
  }

  public async checkClaimed(index: number): Promise<void> {
    const isPaused = await Injector.web3PublicService
      .getWeb3Public(newRubicToken.blockchain)
      .callContractMethod(this.airDropContractAddress, airdropContractAbi, 'isClaimed', [index]);
    if (isPaused) {
      throw new Error('claimed');
    }
  }
}
