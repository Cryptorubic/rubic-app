import { Injectable } from '@angular/core';
import { solarBeamMoonRiverConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/solarbeam-moonriver/solarbeam-moonriver-constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import solarBeamContractAbi from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/models/solar-beam-contract-abi';
import { Multicall } from 'src/app/core/services/blockchain/models/multicall';

@Injectable({
  providedIn: 'root'
})
export class SolarBeamMoonRiverService extends CommonUniswapV2Service {
  constructor() {
    super(solarBeamMoonRiverConstants);
    this.contractAbi = solarBeamContractAbi;
  }

  /**
   * Makes multi call of contract's methods.
   * @param routesMethodArguments Arguments for calling uni-swap contract method.
   * @param methodName Method of contract.
   * @return Promise<Multicall[]>
   */
  protected getRoutes(routesMethodArguments: unknown[], methodName: string): Promise<Multicall[]> {
    const methodParams = routesMethodArguments.map((methodArguments: string[]) => {
      // Solarbeam router requires additional parameter 'fee'
      const solarMethodArguments = methodArguments.concat('25');
      return {
        methodName,
        methodArguments: solarMethodArguments
      };
    });

    return this.web3Public.multicallContractMethods<{ amounts: string[] }>(
      this.contractAddress,
      this.contractAbi,
      methodParams
    );
  }
}
