import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { ERC20_TOKEN_ABI } from '../../web3LEGACY/web3.constants';
import { Transaction } from 'web3-core';

export class Web3Public {
  constructor(private web3: Web3) {}
  /**
   * @description gets account balance in Eth units
   * @param address wallet address whose balance you want to find out
   * @param [options] additional options
   * @param [options.inWei = false] boolean flag to get integer result in Wei
   * @return account balance in Eth (or in Wei if options.inWei === true)
   */
  public async getBalance(address: string, options: { inWei?: boolean } = {}): Promise<BigNumber> {
    const balance = await this.web3.eth.getBalance(address);
    return new BigNumber(options.inWei ? balance : this.weiToEth(balance));
  }

  /**
   * @description gets ERC-20 tokens balance as integer (multiplied to 10 ** decimals)
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param address wallet address whose balance you want to find out
   * @return account tokens balance as integer (multiplied to 10 ** decimals)
   */
  public async getTokenBalance(tokenAddress: string, address: string): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], tokenAddress);

    const balance = await contract.methods.balanceOf(address).call();
    return new BigNumber(balance);
  }

  /**
   * @description predicts the volume of gas required to execute the contract method
   * @param contractAbi abi of smart-contract
   * @param contractAddress address of smart-contract
   * @param methodName method whose execution gas number is to be calculated
   * @param methodArguments arguments of the executed contract method
   * @param [value] The value transferred for the call “transaction” in wei.
   * @return The gas amount estimated
   */
  public async getEstimatedGas(
    // TODO: далеко не факт, что оно будет работать без приватного ключа
    contractAbi: any[],
    contractAddress: string,
    methodName: string,
    methodArguments: any[],
    fromAddress: string,
    value?: string | BigNumber
  ): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    const gasLimit = await contract.methods[methodName](...methodArguments).estimateGas({
      from: fromAddress,
      gas: 40000000,
      ...(value && { value })
    });
    return new BigNumber(gasLimit);
  }

  /**
   * @description calculates the average price per unit of gas according to web3
   * @return average gas price in ETH
   */
  public async getGasPriceInETH(): Promise<BigNumber> {
    const gasPrice = await this.web3.eth.getGasPrice();
    return new BigNumber(gasPrice).div(10 ** 18);
  }

  /**
   * @description calculates the gas fee using average price per unit of gas according to web3 and Eth price according to coingecko
   * @param gasLimit gas limit
   * @param etherPrice price of Eth unit
   * @return gas fee in usd$
   */
  public async getGasFee(gasLimit: BigNumber, etherPrice: BigNumber): Promise<BigNumber> {
    const gasPrice = await this.getGasPriceInETH();
    return gasPrice.multipliedBy(gasLimit).multipliedBy(etherPrice);
  }

  /**
   * @description executes allowance method in ERC-20 token contract
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param spenderAddress wallet or contract address, allowed to spend
   * @param ownerAddress wallet address to spend from
   * @return tokens amount, allowed to be spent
   */
  public async getAllowance(
    tokenAddress: string,
    spenderAddress: string,
    ownerAddress: string
  ): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], tokenAddress);

    const allowance = await contract.methods
      .allowance(ownerAddress, spenderAddress)
      .call({ from: ownerAddress });
    return new BigNumber(allowance);
  }

  /**
   * @description gets mined transaction gas fee in Ether
   * @param hash transaction hash
   * @param [options] additional options
   * @param [options.inWei = false] if true, then the return value will be in Wei
   * @return transaction gas fee in Ether (or in Wei if options.inWei = true) or null if transaction is not mined
   */
  public async getTransactionGasFee(
    hash: string,
    options: { inWei?: boolean } = {}
  ): Promise<BigNumber> {
    const transaction = await this.getTransactionByHash(hash);
    const receipt = await this.web3.eth.getTransactionReceipt(hash);

    if (!transaction || !receipt) {
      return null;
    }

    const gasPrice = new BigNumber(transaction.gasPrice);
    const gasLimit = new BigNumber(receipt.gasUsed);

    return gasPrice.multipliedBy(gasLimit);
  }

  private async getTransactionByHash(hash: string, attempt?: number): Promise<Transaction> {
    attempt = attempt || 0;
    const limit = 10;
    const timeout = 500;

    if (attempt >= limit) {
      return null;
    }

    const transaction = await this.web3.eth.getTransaction(hash);
    if (transaction === null) {
      return new Promise(resolve =>
        setTimeout(() => resolve(this.getTransactionByHash(hash, attempt + 1)), timeout)
      );
    } else {
      return transaction;
    }
  }

  /**
   * @description checks if a given address is a valid Ethereum address
   * @param address the address to check validity
   */
  public isAddressCorrect(address: string) {
    return this.web3.utils.isAddress(address);
  }

  /**
   * @description converts Eth amount into Wei
   * @param value to convert in Eth
   */
  public ethToWei(value: string | BigNumber): string {
    return this.web3.utils.toWei(value.toString(), 'ether');
  }

  /**
   * @description converts Wei amount into Eth
   * @param value to convert in Wei
   */
  public weiToEth(value: string | BigNumber): string {
    return this.web3.utils.fromWei(value.toString(), 'ether');
  }

  /**
   * @description checks if address is Ether native address
   * @param address address to check
   */
  public isNativeAddress(address: string): boolean {
    return address === '0x0000000000000000000000000000000000000000';
  }
}
