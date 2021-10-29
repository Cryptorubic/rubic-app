import Web3 from 'web3';
import { Method } from 'web3-core-method';
import BigNumber from 'bignumber.js';
import { HttpProvider, provider as Provider, Transaction } from 'web3-core';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainTokenExtended } from 'src/app/shared/models/tokens/BlockchainTokenExtended';
import { AbiItem, fromWei, isAddress, toChecksumAddress, toWei } from 'web3-utils';
import { BlockTransactionString } from 'web3-eth';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import InsufficientFundsError from 'src/app/core/errors/models/instant-trade/InsufficientFundsError';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/BIG_NUMBER_FORMAT';
import { from, Observable, of } from 'rxjs';
import { HEALTHCHECK } from 'src/app/core/services/blockchain/constants/healthcheck';
import { catchError, map, timeout } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BatchCall } from 'src/app/core/services/blockchain/models/BatchCall';
import { RpcResponse } from 'src/app/core/services/blockchain/models/RpcResponse';
import { Cacheable } from 'ts-cacheable';
import { MethodData } from 'src/app/shared/models/blockchain/MethodData';
import ERC20_TOKEN_ABI from 'src/app/core/services/blockchain/constants/erc-20-abi';
import MULTICALL_ABI from 'src/app/core/services/blockchain/constants/multicall-abi';
import { Call } from 'src/app/core/services/blockchain/models/call';
import {
  MULTICALL_ADDRESSES,
  MULTICALL_ADDRESSES_TESTNET
} from 'src/app/core/services/blockchain/constants/multicall-addresses';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import {
  GetEthTrxByHashParams,
  PublicBlockchainAdapter,
  Web3EthSupportedBlockchains
} from 'src/app/core/services/blockchain/blockchain-public/types';
import { BlockchainPublicService } from 'src/app/core/services/blockchain/blockchain-public/blockchain-public.service';

interface MulticallResponse {
  success: boolean;
  returnData: string;
}

export class Web3Public extends PublicBlockchainAdapter {
  private multicallAddresses: { [k in BLOCKCHAIN_NAME]?: string };

  constructor(
    private web3: Web3,
    public blockchain: IBlockchain,
    useTestingModeService: UseTestingModeService,
    private readonly httpClient: HttpClient
  ) {
    super();
    this.multicallAddresses = MULTICALL_ADDRESSES;

    useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.multicallAddresses = MULTICALL_ADDRESSES_TESTNET;
      }
    });
  }

  static get nativeTokenAddress(): string {
    return NATIVE_TOKEN_ADDRESS;
  }

  static calculateGasMargin(amount: BigNumber | string | number, percent: number): string {
    return new BigNumber(amount || '0').multipliedBy(percent).toFixed(0);
  }

  static addressToBytes32(address: string): string {
    if (address.slice(0, 2) !== '0x' || address.length !== 42) {
      console.error('Wrong address format');
      throw new UndefinedError();
    }

    return `0x${address.slice(2).padStart(64, '0')}`;
  }

  static toChecksumAddress(address: string): string {
    return toChecksumAddress(address);
  }

  /**
   * converts Eth amount into Wei
   * @param value to convert in Eth
   */
  static ethToWei(value: string | BigNumber): string {
    return toWei(value.toString(), 'ether');
  }

  /**
   * converts Wei amount into Eth
   * @param value to convert in Wei
   */
  static weiToEth(value: string | BigNumber): string {
    return fromWei(value.toString(), 'ether');
  }

  /**
   * checks if address is Ether native address
   * @param address address to check
   */
  public isNativeAddress = (address: string): boolean => {
    return address === NATIVE_TOKEN_ADDRESS;
  };

  /**
   * checks if a given address is a valid Ethereum address
   * @param address the address to check validity
   */
  public isAddressCorrect(address: string): boolean {
    return isAddress(address);
  }

  /**
   * set new web3 provider
   * @param provider
   */
  public setProvider(provider: Provider): void {
    this.web3.setProvider(provider);
  }

  /**
   * HealthCheck current rpc node
   * @param timeoutMs acceptable node response timeout
   * @return null if healthcheck is not defined for current blockchain, else is node works status
   */
  public healthCheck(timeoutMs: number = 4000): Observable<boolean> {
    const healthcheckData = HEALTHCHECK[this.blockchain.name as Web3EthSupportedBlockchains];
    if (!healthcheckData) {
      return of(null);
    }

    const contract = new this.web3.eth.Contract(
      healthcheckData.contractAbi,
      healthcheckData.contractAddress
    );

    return from(contract.methods[healthcheckData.method]().call()).pipe(
      timeout(timeoutMs),
      map(result => result === healthcheckData.expected),
      catchError(err => {
        if (err?.name === 'TimeoutError') {
          console.debug(
            `${this.blockchain.label} node healthcheck timeout (${timeoutMs}ms) has occurred.`
          );
        } else {
          console.debug(`${this.blockchain.label} node healthcheck fail: ${err}`);
        }
        return of(false);
      })
    );
  }

  /**
   * gets account balance in Eth units
   * @param address wallet address whose balance you want to find out
   * @param [options] additional options
   * @param [options.inWei = false] boolean flag to get integer result in Wei
   * @return account balance in Eth (or in Wei if options.inWei === true)
   */
  public async getBalance(address: string, options: { inWei?: boolean } = {}): Promise<BigNumber> {
    const balance = await this.web3.eth.getBalance(address);
    return new BigNumber(options.inWei ? balance : Web3Public.weiToEth(balance));
  }

  /**
   *
   * @param userAddress wallet address whose balance you want to find out
   * @param tokenAddress address of the smart-contract corresponding to the token
   */
  public async getTokenOrNativeBalance(
    userAddress: string,
    tokenAddress: string
  ): Promise<BigNumber> {
    const balance = this.isNativeAddress(tokenAddress)
      ? await this.web3.eth.getBalance(userAddress)
      : await this.getTokenBalance(userAddress, tokenAddress);

    return new BigNumber(balance);
  }

  /**
   * gets ERC-20 tokens balance as integer (multiplied to 10 ** decimals)
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param address wallet address whose balance you want to find out
   * @return account tokens balance as integer (multiplied to 10 ** decimals)
   */
  public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as AbiItem[], tokenAddress);

    const balance = await contract.methods.balanceOf(address).call();
    return new BigNumber(balance);
  }

  /**
   * get latest block
   */
  public getBlock(): Promise<BlockTransactionString> {
    return this.web3.eth.getBlock('latest');
  }

  /**
   * predicts the volume of gas required to execute the contract method
   * @param contractAbi abi of smart-contract
   * @param contractAddress address of smart-contract
   * @param methodName method whose execution gas number is to be calculated
   * @param methodArguments arguments of the executed contract method
   * @param fromAddress the address for which the gas calculation will be called
   * @param [value] The value transferred for the call “transaction” in wei.
   * @return The gas amount estimated
   */
  public async getEstimatedGas(
    contractAbi: AbiItem[],
    contractAddress: string,
    methodName: string,
    methodArguments: unknown[],
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
   * calculates the average price per unit of gas according to web3
   * @return average gas price in Wei
   */
  public async getGasPrice(): Promise<string> {
    return this.getGasPrice$().toPromise();
  }

  /**
   * calculates the average price per unit of gas according to web3
   * @return average gas price in ETH
   */
  public async getGasPriceInETH(): Promise<BigNumber> {
    const gasPrice = await this.getGasPrice();
    return new BigNumber(gasPrice).div(10 ** 18);
  }

  /**
   * calculates the gas fee using average price per unit of gas according to web3 and Eth price according to coingecko
   * @param gasLimit gas limit
   * @param etherPrice price of Eth unit
   * @return gas fee in usd$
   */
  public async getGasFee(gasLimit: BigNumber, etherPrice: BigNumber): Promise<BigNumber> {
    const gasPrice = await this.getGasPriceInETH();
    return gasPrice.multipliedBy(gasLimit).multipliedBy(etherPrice);
  }

  /**
   * executes allowance method in ERC-20 token contract
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param ownerAddress wallet address to spend from
   * @param spenderAddress wallet or contract address, allowed to spend
   * @return tokens amount, allowed to be spent
   */
  public async getAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string
  ): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as AbiItem[], tokenAddress);

    const allowance = await contract.methods
      .allowance(ownerAddress, spenderAddress)
      .call({ from: ownerAddress });
    return new BigNumber(allowance);
  }

  /**
   * gets mined transaction gas fee in Ether
   * @param hash transaction hash
   * @param [options] additional options
   * @param [options.inWei = false] if true, then the return value will be in Wei
   * @return transaction gas fee in Ether (or in Wei if options.inWei = true) or null if transaction is not mined
   */
  public async getTransactionGasFee(
    hash: string,
    options: { inWei?: boolean } = {}
  ): Promise<BigNumber> {
    const transaction = await this.waitForTransaction({
      hash
    });
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

  /**
   * Gets a transaction by hash in several attempts.
   * @param params Object with hash, attempts,and delay params.
   */
  public async waitForTransaction(params: GetEthTrxByHashParams): Promise<Transaction> {
    params.attempt = params.attempt || 0;
    const limit = params.attemptLimit || 10;
    const timeoutMs = params.delay || 500;

    if (params.attempt >= limit) {
      return null;
    }

    const transaction = await this.web3.eth.getTransaction(params.hash);
    if (transaction === null) {
      return new Promise(resolve =>
        setTimeout(
          () =>
            resolve(
              this.waitForTransaction({
                hash: params.hash,
                attempt: params.attempt + 1
              })
            ),
          timeoutMs
        )
      );
    }
    return transaction;
  }

  /**
   * call smart-contract pure method of smart-contract and returns its output value
   * @param contractAddress address of smart-contract which method is to be executed
   * @param contractAbi abi of smart-contract which method is to be executed
   * @param methodName calling method name
   * @param [options] additional options
   * @param [options.from] the address the call “transaction” should be made from
   * @param [options.methodArguments] executing method arguments
   * @return smart-contract pure method returned value
   */
  public async callContractMethod<T = string>(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    options: {
      methodArguments?: unknown[];
      from?: string;
    } = { methodArguments: [] }
  ): Promise<T> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    return contract.methods[methodName](...options.methodArguments).call({
      ...(options.from && { from: options.from })
    });
  }

  /**
   * Gets information about token through ERC-20 token contract.
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param blockchain platform of the token
   * @return object, with written token fields, or a error, if there's no such token
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public getTokenInfo: (tokenAddress: string) => Promise<BlockchainTokenExtended> =
    this.getTokenInfoCachingDecorator();

  private getTokenInfoCachingDecorator(): (
    tokenAddress: string
  ) => Promise<BlockchainTokenExtended> {
    const tokensCache: { [address: string]: BlockchainTokenExtended } = {};

    return async (tokenAddress: string): Promise<BlockchainTokenExtended> => {
      if (!tokensCache[tokenAddress]) {
        tokensCache[tokenAddress] = await this.callForTokenInfo(tokenAddress);
      }

      return tokensCache[tokenAddress];
    };
  }

  /**
   * get ERC-20 token info by address
   * @param tokenAddress address of token
   */
  private async callForTokenInfo(tokenAddress: string): Promise<BlockchainTokenExtended> {
    if (this.isNativeAddress(tokenAddress)) {
      return {
        ...this.blockchain.nativeCoin,
        blockchain: this.blockchain.name
      };
    }

    const tokenMethods = ['decimals', 'symbol', 'name', 'totalSupply'] as const;
    const tokenFieldsPromises = tokenMethods.map((method: string) =>
      this.callContractMethod(tokenAddress, ERC20_TOKEN_ABI, method)
    );
    const token: BlockchainTokenExtended = {
      blockchain: this.blockchain.name,
      address: tokenAddress
    } as BlockchainTokenExtended;

    (await Promise.all(tokenFieldsPromises)).forEach(
      // @ts-ignore
      (elem, index) => (token[tokenMethods[index]] = elem)
    );

    token.decimals = Number(token.decimals);

    return token;
  }

  /**
   * get balance of multiple tokens via multicall
   * @param address wallet address
   * @param tokensAddresses tokens addresses
   */
  public async getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as AbiItem[], tokensAddresses[0]);
    const indexOfNativeCoin = tokensAddresses.findIndex(this.isNativeAddress);
    const promises: [Promise<MulticallResponse[]>, Promise<BigNumber>] = [undefined, undefined];

    if (indexOfNativeCoin !== -1) {
      tokensAddresses.splice(indexOfNativeCoin, 1);
      promises[1] = this.getBalance(address, { inWei: true });
    }
    const calls: Call[] = tokensAddresses.map(tokenAddress => ({
      target: tokenAddress,
      callData: contract.methods.balanceOf(address).encodeABI()
    }));
    promises[0] = this.multicall(calls);

    const results = await Promise.all(promises);
    const tokensBalances = results[0].map(({ success, returnData: hexBalance }) =>
      success ? new BigNumber(hexBalance) : new BigNumber(0)
    );

    if (indexOfNativeCoin !== -1) {
      tokensBalances.splice(indexOfNativeCoin, 0, results[1]);
    }

    return tokensBalances;
  }

  /**
   * Uses multicall to make many methods calls in one contract.
   * @param contractAddress Target contract address.
   * @param contractAbi Target contract abi.
   * @param methodsData Methods data, containing methods' names and arguments.
   */
  public async multicallContractMethods<Output>(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodsData: MethodData[]
  ): Promise<
    {
      success: boolean;
      output: Output;
    }[]
  > {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    const calls: Call[] = methodsData.map(({ methodName, methodArguments }) => ({
      callData: contract.methods[methodName](...methodArguments).encodeABI(),
      target: contractAddress
    }));
    const outputs = await this.multicall(calls);
    return outputs.map((output, index) => {
      const methodOutputAbi = contractAbi.find(
        funcSignature => funcSignature.name === methodsData[index].methodName
      ).outputs;
      return {
        success: output.success,
        output: output.success
          ? (this.web3.eth.abi.decodeParameters(methodOutputAbi, output.returnData) as Output)
          : null
      };
    });
  }

  /**
   * Uses multicall to make many methods calls in several contracts.
   * @param contractAbi Target contract abi.
   * @param contractsData Contract addresses and methods data, containing methods' names and arguments.
   */
  public async multicallContractsMethods<Output>(
    contractAbi: AbiItem[],
    contractsData: {
      contractAddress: string;
      methodsData: MethodData[];
    }[]
  ): Promise<
    {
      success: boolean;
      output: Output;
    }[][]
  > {
    const calls: Call[][] = contractsData.map(({ contractAddress, methodsData }) => {
      const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
      return methodsData.map(({ methodName, methodArguments }) => ({
        callData: contract.methods[methodName](...methodArguments).encodeABI(),
        target: contractAddress
      }));
    });

    const outputs = await this.multicall(calls.flat());

    let outputIndex = 0;
    return contractsData.map(contractData =>
      contractData.methodsData.map(methodData => {
        const methodOutputAbi = contractAbi.find(
          funcSignature => funcSignature.name === methodData.methodName
        ).outputs;
        const output = outputs[outputIndex];
        outputIndex++;

        return {
          success: output.success,
          output: output.success
            ? (this.web3.eth.abi.decodeParameters(methodOutputAbi, output.returnData) as Output)
            : null
        };
      })
    );
  }

  private async multicall(calls: Call[]): Promise<MulticallResponse[]> {
    const contract = new this.web3.eth.Contract(
      MULTICALL_ABI,
      this.multicallAddresses[this.blockchain.name]
    );
    return contract.methods.tryAggregate(false, calls).call();
  }

  /**
   * Checks if the specified address contains the required amount of these tokens.
   * Throws an InsufficientFundsError if the balance is insufficient
   * @param token token balance for which you need to check
   * @param amount required balance
   * @param userAddress the address where the required balance should be
   */
  public async checkBalance(
    token: { address: string; symbol: string; decimals: number },
    amount: BigNumber,
    userAddress: string
  ): Promise<void> {
    const balance = this.isNativeAddress(token.address)
      ? await this.getBalance(userAddress, {
          inWei: true
        })
      : await this.getTokenBalance(userAddress, token.address);

    const amountAbsolute = BlockchainPublicService.toWei(amount, token.decimals);
    if (balance.lt(amountAbsolute)) {
      const formattedTokensBalance = BlockchainPublicService.fromWei(
        balance,
        token.decimals
      ).toFormat(BIG_NUMBER_FORMAT);
      throw new InsufficientFundsError(
        token.symbol,
        formattedTokensBalance,
        amount.toFormat(BIG_NUMBER_FORMAT)
      );
    }
  }

  /**
   * get estimated gas of several contract method execution via rpc batch request
   * @param abi contract ABI
   * @param contractAddress contract address
   * @param fromAddress sender address
   * @param callsData transactions parameters
   * @returns list of contract execution estimated gases.
   * if the execution of the method in the real blockchain would not be reverted,
   * then the list item would be equal to the predicted gas limit.
   * Else (if you have not enough balance, allowance ...) then the list item would be equal to null
   */
  public async batchEstimatedGas(
    abi: AbiItem[],
    contractAddress: string,
    fromAddress: string,
    callsData: BatchCall[]
  ): Promise<BigNumber[]> {
    try {
      const contract = new this.web3.eth.Contract(abi, contractAddress);

      const dataList = callsData.map(callData =>
        contract.methods[callData.contractMethod](...callData.params).encodeABI()
      );

      const rpcCallsData = dataList.map((data, index) => ({
        rpcMethod: 'eth_estimateGas',
        params: {
          from: fromAddress,
          to: contractAddress,
          data,
          ...(callsData[index].value && {
            value: `0x${new BigNumber(callsData[index].value).toString(16)}`
          })
        }
      }));

      const result = await this.rpcBatchRequest<string>(rpcCallsData);
      return result.map(value => value && new BigNumber(value));
    } catch (e) {
      console.error(e);
      return callsData.map(() => null);
    }
  }

  /**
   * Sends batch request via web3.
   * @see {@link https://web3js.readthedocs.io/en/v1.3.0/web3-eth.html#batchrequest|Web3BatchRequest}
   * @param calls Web3 method calls
   * @param callsParams ethereum method transaction parameters
   * @returns batch request call result sorted in order of input parameters
   */
  private web3BatchRequest<T extends string | string[]>(
    calls: { request: (...params: unknown[]) => Method }[],
    callsParams: Object[]
  ): Promise<T[]> {
    const batch = new this.web3.BatchRequest();
    const promises: Promise<T>[] = calls.map(
      (call, index) =>
        new Promise((resolve, reject) =>
          batch.add(
            call.request({ ...callsParams[index] }, (error: Error, result: T) =>
              error ? reject(error) : resolve(result)
            )
          )
        )
    );

    batch.execute();

    return Promise.all(promises);
  }

  /**
   * Sends batch request to rpc provider directly.
   * @see {@link https://playground.open-rpc.org/?schemaUrl=https://raw.githubusercontent.com/ethereum/eth1.0-apis/assembled-spec/openrpc.json&uiSchema%5BappBar%5D%5Bui:splitView%5D=false&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false|EthereumJSON-RPC}
   * @param rpcCallsData rpc methods and parameters list
   * @returns rpc batch request call result sorted in order of input parameters
   */
  private async rpcBatchRequest<T extends string | string[]>(
    rpcCallsData: {
      rpcMethod: string;
      params: Object;
    }[]
  ): Promise<T[]> {
    const seed = Date.now();
    const batch = rpcCallsData.map((callData, index) => ({
      id: seed + index,
      jsonrpc: '2.0',
      method: callData.rpcMethod,
      params: [{ ...callData.params }]
    }));

    const response = await this.httpClient
      .post<RpcResponse<T>[]>((<HttpProvider>this.web3.currentProvider).host, batch)
      .toPromise();

    if (Array.isArray(response)) {
      return response.sort((a, b) => a.id - b.id).map(item => (item.error ? null : item.result));
    }
    return [response];
  }

  /**
   * calculates the average price per unit of gas according to web3
   * @return average gas price in Wei
   */
  @Cacheable({ maxAge: 10000 })
  private getGasPrice$(): Observable<string> {
    return from(this.web3.eth.getGasPrice());
  }
}
