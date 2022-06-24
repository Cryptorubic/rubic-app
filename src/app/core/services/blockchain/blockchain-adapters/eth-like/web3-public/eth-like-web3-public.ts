import Web3 from 'web3';
import { Method } from 'web3-core-method';
import { TransactionReceipt } from 'web3-eth';
import BigNumber from 'bignumber.js';
import { HttpProvider, provider as Provider, Transaction } from 'web3-core';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { BlockchainTokenExtended } from '@shared/models/tokens/blockchain-token-extended';
import { AbiItem, isAddress, toChecksumAddress } from 'web3-utils';
import { BlockTransactionString } from 'web3-eth';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { UndefinedError } from '@core/errors/models/undefined.error';
import { from, Observable, of } from 'rxjs';
import { HEALTHCHECK } from '@core/services/blockchain/constants/healthcheck';
import { catchError, map, timeout } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BatchCall } from '@core/services/blockchain/models/batch-call';
import { RpcResponse } from '@core/services/blockchain/models/rpc-response';
import { Cacheable } from 'ts-cacheable';
import { MethodData } from '@shared/models/blockchain/method-data';
import ERC20_TOKEN_ABI from '@core/services/blockchain/constants/erc-20-abi';
import MULTICALL_ABI from '@core/services/blockchain/constants/multicall-abi';
import { Call } from '@core/services/blockchain/models/call';
import { MULTICALL_ADDRESS } from '@core/services/blockchain/constants/multicall-addresses';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { Web3Public } from '@core/services/blockchain/blockchain-adapters/common/web3-public';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';

type AllowanceParams = {
  /**
   * Address of the smart-contract corresponding to the token.
   */
  tokenAddress: string;

  /**
   * Wallet address to spend from.
   */
  ownerAddress: string;

  /**
   * Wallet or contract address, allowed to spend.
   */
  spenderAddress: string;
};

interface MulticallResponse {
  success: boolean;
  returnData: string;
}

const supportedTokenFields = ['decimals', 'symbol', 'name', 'totalSupply'] as const;

type TokenField = typeof supportedTokenFields[number];

type TokenFields = Partial<Record<TokenField, string>>;

export class EthLikeWeb3Public extends Web3Public<AllowanceParams, Transaction> {
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

  public readonly nativeTokenAddress = NATIVE_TOKEN_ADDRESS;

  private readonly multicallAddress = MULTICALL_ADDRESS[this.blockchain.name];

  constructor(
    private readonly web3: Web3,
    public readonly blockchain: BlockchainData<EthLikeBlockchainName>,
    private readonly httpClient: HttpClient
  ) {
    super();
  }

  /**
   * Checks if a given address is a valid Ethereum address.
   * @param address The address to check validity.
   */
  public isAddressCorrect(address: string): boolean {
    return isAddress(address);
  }

  /**
   * Sets new provider.
   * @param provider Provider to set.
   */
  public setProvider(provider: Provider): void {
    this.web3.setProvider(provider);
  }

  /**
   * HealthCheck current rpc node.
   * @param timeoutMs Acceptable node response timeout.
   * @return null If Healthcheck is not defined for current blockchain, else is node works status.
   */
  public healthCheck(timeoutMs: number = 4000): Observable<boolean> {
    const healthcheckData = HEALTHCHECK[this.blockchain.name];
    if (!healthcheckData) {
      return of(null);
    }

    const contract = new this.web3.eth.Contract(
      healthcheckData.contractAbi,
      healthcheckData.contractAddress
    );

    return from(contract.methods.symbol().call()).pipe(
      timeout(timeoutMs),
      map(result => result === healthcheckData.expected),
      catchError((err: unknown) => {
        if ((err as Error)?.name === 'TimeoutError') {
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
    return new BigNumber(options.inWei ? balance : Web3Pure.fromWei(balance));
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
    let balance;
    if (this.isNativeAddress(tokenAddress)) {
      balance = await this.web3.eth.getBalance(userAddress);
    } else {
      balance = await this.getTokenBalance(userAddress, tokenAddress);
    }
    return new BigNumber(balance);
  }

  /**
   * gets ERC-20 tokens balance as integer (multiplied to 10 ** decimals)
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param address wallet address whose balance you want to find out
   * @return account tokens balance as integer (multiplied to 10 ** decimals)
   */
  public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress);
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
   * Calculates the average price per unit of gas according to web3.
   * @return average gas price in Wei
   */
  public async getGasPrice(): Promise<string> {
    return this.getGasPrice$().toPromise();
  }

  /**
   * Calculates the average price per unit of gas according to web3
   * @return average gas price in ETH
   */
  public async getGasPriceInETH(): Promise<BigNumber> {
    const gasPrice = await this.getGasPrice();
    return new BigNumber(gasPrice).div(10 ** 18);
  }

  /**
   * Calculates the gas fee using average price per unit of gas according to web3 and Eth price according to coingecko.
   * @param gasLimit gas limit
   * @param etherPrice price of Eth unit
   * @return gas fee in usd$
   */
  public async getGasFee(gasLimit: BigNumber, etherPrice: BigNumber): Promise<BigNumber> {
    const gasPrice = await this.getGasPriceInETH();
    return gasPrice.multipliedBy(gasLimit).multipliedBy(etherPrice);
  }

  /**
   * Executes allowance method in ERC-20 token contract.
   * @param params {@link AllowanceParams}.
   * @return Promise<BigNumber> Amount, allowed to be spent
   */
  public async getAllowance(params: AllowanceParams): Promise<BigNumber> {
    const { tokenAddress, ownerAddress, spenderAddress } = params;
    if (this.isNativeAddress(tokenAddress)) {
      return new BigNumber(Infinity);
    }

    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress);

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

  /**
   * get a transaction by hash in several attempts
   * @param hash hash of the target transaction
   * @param attempt current attempt number
   * @param attemptsLimit maximum allowed number of attempts
   * @param delay ms delay before next attempt
   */
  public async getTransactionByHash(
    hash: string,
    attempt?: number,
    attemptsLimit?: number,
    delay?: number
  ): Promise<Transaction> {
    attempt = attempt || 0;
    const limit = attemptsLimit || 10;
    const timeoutMs = delay || 500;

    if (attempt >= limit) {
      return null;
    }

    const transaction = await this.web3.eth.getTransaction(hash);
    if (transaction === null) {
      return new Promise(resolve =>
        setTimeout(() => resolve(this.getTransactionByHash(hash, attempt + 1)), timeoutMs)
      );
    }
    return transaction;
  }

  public async getTransactionReceipt(hash: string): Promise<TransactionReceipt> {
    return this.web3.eth.getTransactionReceipt(hash);
  }

  public async getBlockNumber(): Promise<number> {
    return this.web3.eth.getBlockNumber();
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
   * Gets token's symbol through ERC-20 token contract.
   * @param tokenAddress Address of the smart-contract corresponding to the token.
   * @return string Tokens's symbol or a error, if there's no such token.
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public getTokenSymbol: (tokenAddress: string) => Promise<string> =
    this.getTokenSymbolCachingDecorator();

  private getTokenSymbolCachingDecorator(): (tokenAddress: string) => Promise<string> {
    const tokensSymbolsCache: { [address: string]: string } = {};

    return async (tokenAddress: string): Promise<string> => {
      if (!tokensSymbolsCache[tokenAddress]) {
        tokensSymbolsCache[tokenAddress] = (
          await this.callForTokenInfo(tokenAddress, ['symbol'])
        ).symbol;
      }

      return tokensSymbolsCache[tokenAddress];
    };
  }

  /**
   * Gets information about token through ERC-20 token contract.
   * @param tokenAddress Address of the smart-contract corresponding to the token.
   * @return object Object, with written token fields, or a error, if there's no such token
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
        if (this.isNativeAddress(tokenAddress)) {
          return {
            ...this.blockchain.nativeCoin,
            blockchain: this.blockchain.name
          };
        }

        const tokenInfo = (await this.callForTokenInfo(tokenAddress)) as Record<TokenField, string>;
        tokensCache[tokenAddress] = {
          blockchain: this.blockchain.name,
          address: tokenAddress,
          ...tokenInfo,
          decimals: Number(tokenInfo.decimals)
        };
      }

      return tokensCache[tokenAddress];
    };
  }

  /**
   * Gets ERC-20 token info by address.
   * @param tokenAddress Address of token.
   * @param tokenFields Tokens's fields to get.
   */
  private async callForTokenInfo(
    tokenAddress: string,
    tokenFields: TokenField[] = ['decimals', 'symbol', 'name', 'totalSupply']
  ): Promise<TokenFields> {
    const tokenFieldsPromises = tokenFields.map(method =>
      this.callContractMethod(tokenAddress, ERC20_TOKEN_ABI, method)
    );
    const tokenFieldsResults = await Promise.all(tokenFieldsPromises);
    return Object.fromEntries(
      tokenFieldsResults.map((field, index) => [tokenFields[index], field])
    );
  }

  /**
   * get balance of multiple tokens via multicall
   * @param address wallet address
   * @param tokensAddresses tokens addresses
   */
  public async getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI, tokensAddresses[0]);
    const indexOfNativeCoin = tokensAddresses.findIndex(this.isNativeAddress.bind(this));
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
    const contract = new this.web3.eth.Contract(MULTICALL_ABI, this.multicallAddress);
    return contract.methods.tryAggregate(false, calls).call();
  }

  /**
   * get estimated gas of several contract method execution via rpc batch request
   * @param abi contract ABI
   * @param contractAddress contract address
   * @param fromAddress sender address
   * @param callsData transactions parameters
   * @return list of contract execution estimated gases.
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
   * @return batch request call result sorted in order of input parameters
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
   * @return rpc batch request call result sorted in order of input parameters
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

  /**
   * Tries to execute method of smart-contract.
   * @param contractAddress Address of smart-contract which method is to be executed.
   * @param contractAbi Abi of smart-contract which method is to be executed.
   * @param methodName Method to execute.
   * @param methodArguments Method's arguments.
   * @param fromAddress Address, from which transaction will be sent.
   * @param [options] Additional options.
   * @param [options.value] Value in Wei to be attached to the transaction.
   * @param [options.gas] Gas limit to be attached to the transaction.
   */
  public async tryExecuteContractMethod(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: unknown[],
    fromAddress: string,
    options: TransactionOptions = {}
  ): Promise<void | never> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    try {
      await contract.methods[methodName](...methodArguments).call({
        from: fromAddress,
        ...(options.value && { value: options.value }),
        ...(options.gas && { gas: options.gas })
        // ...(options.gasPrice && { gasPrice: options.gasPrice }) doesn't work on mobile
      });
      return;
    } catch (err) {
      console.error('Method execution error:', err);
      throw err;
    }
  }
}
