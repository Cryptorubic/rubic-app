import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { ERC20_TOKEN_ABI } from '../../web3LEGACY/web3.constants';
import { Transaction } from 'web3-core';
import { BLOCKCHAIN_NAMES } from '../../../pages/main-page/trades-form/types';
import { TokenInfoBody } from '../web3-private-service/types';
import { nativeTokens } from '../web3-private-service/native-tokens';
import { Contract } from 'web3-eth-contract';

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
  public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
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
   * @param fromAddress the address for which the gas calculation will be called
   * @param [value] The value transferred for the call “transaction” in wei.
   * @return The gas amount estimated
   */
  public async getEstimatedGas(
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
    ownerAddress: string,
    spenderAddress: string
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

    return options.inWei
      ? gasPrice.multipliedBy(gasLimit)
      : gasPrice.multipliedBy(gasLimit).div(10 ** 18);
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

  /**
   * @description gets information about token through ERC-20 token contract
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param blockchain platform of the token
   * @return object, with written token fields, or a error, if there's no such token
   */
  public getTokenInfo: (
    tokenAddress: string,
    blockchain: BLOCKCHAIN_NAMES
  ) => Promise<TokenInfoBody> = this.getTokenInfoCachingDecorator();

  /**
   * @description call smart-contract pure method of smart-contract and returns its output value
   * @param contractAddress address of smart-contract which method is to be executed
   * @param contractAbi abi of smart-contract which method is to be executed
   * @param methodName calling method name
   * @param methodArguments executing method arguments
   * @param [options] additional options
   * @param [options.from] the address the call “transaction” should be made from
   * @return smart-contract pure method returned value
   */
  public async callContractMethod(
    contractAddress: string,
    contractAbi: any[],
    methodName: string,
    methodArguments: any[],
    options: {
      from?: string;
    } = {}
  ): Promise<unknown> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    return contract.methods[methodName](...methodArguments).call({
      ...(options.from && { from: options.from })
    });
  }

  private getTokenInfoCachingDecorator() {
    const tokensBodyCache = new Map<
      { tokenAddress: string; blockchain: BLOCKCHAIN_NAMES },
      TokenInfoBody
    >();

    return async (tokenAddress: string, blockchain: BLOCKCHAIN_NAMES): Promise<TokenInfoBody> => {
      if (tokensBodyCache.has({ tokenAddress, blockchain })) {
        return tokensBodyCache.get({ tokenAddress, blockchain });
      }

      const tokenBody = await this.getTokenBody(tokenAddress, blockchain);
      tokensBodyCache.set({ tokenAddress, blockchain }, tokenBody);

      return tokenBody;
    };
  }

  private async getTokenBody(
    tokenAddress: string,
    blockchain: BLOCKCHAIN_NAMES
  ): Promise<TokenInfoBody> {
    if (this.isEtherAddress(tokenAddress)) {
      const tokenBody = nativeTokens.find(t => t.platform === blockchain);
      if (tokenBody) {
        return tokenBody;
      } else {
        throw new Error(`No token for ${blockchain} blockchain`);
      }
    }

    const contract = new this.web3Infura[blockchain].eth.Contract(
      ERC20_TOKEN_ABI as any[],
      tokenAddress
    );
    const tokenFields = ['decimals', 'symbol', 'name'];

    const tokenBody = {} as TokenInfoBody;
    const tokenFieldsPromises = [];
    tokenFields.forEach(tokenField => {
      tokenFieldsPromises.push(this.setTokenField(contract, tokenField, tokenBody));
    });

    await Promise.all(tokenFieldsPromises);
    return tokenBody;
  }

  private setTokenField(
    contract: Contract,
    tokenField: string,
    tokenBody: TokenInfoBody
  ): Promise<any> {
    return contract.methods[tokenField]()
      .call()
      .then(value => {
        if (tokenField === 'decimals') {
          tokenBody[tokenField] = parseInt(value);
        } else {
          tokenBody[tokenField] = value;
        }
      });
  }
}
