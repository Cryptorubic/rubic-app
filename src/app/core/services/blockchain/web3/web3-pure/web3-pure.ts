import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

export class Web3Pure {
  private static readonly web3 = new Web3();

  /**
   * Encodes a function call using its JSON interface object and given parameters.
   * @param contractAbi The JSON interface object of a function.
   * @param methodName Method name to encode.
   * @param methodArguments Parameters to encode.
   * @return string An ABI encoded function call. Means function signature + parameters.
   */
  public static async encodeFunctionCall(
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: unknown[]
  ): Promise<string> {
    const methodSignature = contractAbi.find(abiItem => abiItem.name === methodName);
    if (methodSignature === undefined) {
      throw Error('No such method in abi');
    }
    return Web3Pure.web3.eth.abi.encodeFunctionCall(methodSignature, methodArguments as string[]);
  }

  /**
   * Encodes passed parameter to solidity type.
   * @param type Solidity type.
   * @param parameter Parameter to encode.
   * @return string Encoded parameter.
   */
  public static async encodeParameter(type: 'uint256', parameter: unknown): Promise<string> {
    return Web3Pure.web3.eth.abi.encodeParameter(type, parameter);
  }
}
