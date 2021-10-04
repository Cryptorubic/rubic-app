import { Injectable } from '@angular/core';
import { solarBeamMoonRiverConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/solarbeam-moonriver/solarbeam-moonriver-constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import solarBeamContractAbi from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/models/solar-beam-contract-abi';

@Injectable({
  providedIn: 'root'
})
export class SolarBeamMoonRiverService extends CommonUniswapV2Service {
  constructor() {
    super(solarBeamMoonRiverConstants);
    this.contractAbi = solarBeamContractAbi;
  }

  /**
   * Makes multi call method of contract.
   * @param routesMethodArguments Arguments for calling method of contract.
   * @param methodName Method of contract.
   * @param fee Base fee for tx.
   */
  protected getRoutes(routesMethodArguments: unknown[], methodName: string, fee = '0') {
    const methodParams = routesMethodArguments.map((methodArguments: string[]) => {
      methodArguments.push(fee);
      return {
        methodName,
        methodArguments
      };
    });

    return this.web3Public.multicallContractMethods<{ amounts: string[] }>(
      this.contractAddress,
      this.contractAbi,
      methodParams
    );
  }
}
