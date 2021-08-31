import { TestBed } from '@angular/core/testing';

import { AbiItem } from 'web3-utils';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { coingeckoTestTokens } from 'src/test/tokens/test-tokens';
import {
  ETH,
  WEENUS,
  WETH,
  WSATT,
  XEENUS,
  YEENUS
} from 'src/test/tokens/blockchain-tokens/ethereum-test-tokens';
import { Web3PublicService } from './web3-public.service';
import { PublicProviderService } from '../public-provider/public-provider.service';

import { Web3Public } from './Web3Public';
// @ts-ignore
import config from '../../../../../test/enviroment.test.json';
import publicProviderServiceStub from '../public-provider/public-provider-service-stub';

import ERC20_TOKEN_ABI from '../constants/erc-20-abi';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';
import { useTestingModeStub } from '../../use-testing-mode/use-testing-mode.stub';

describe('Web3PublicService', () => {
  let service: Web3PublicService;
  let originalTimeout: number;

  const blockchainName = BLOCKCHAIN_NAME.ETHEREUM;
  const aliceAddress = config.testWallet.address;
  const bobAddress = config.testReceiverAddress;
  const getWeb3Public: () => Web3Public = () => service[blockchainName];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PublicProviderService, useValue: publicProviderServiceStub() },
        { provide: UseTestingModeService, useValue: useTestingModeStub() }
      ]
    });
    service = TestBed.inject(Web3PublicService);
  });

  beforeAll(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get balance works', async done => {
    const balance = await getWeb3Public().getBalance(aliceAddress);

    expect(balance).not.toBe(undefined);
    expect(balance.gt(0)).toBeTruthy();
    done();
  });

  it('balance of works (tokens)', async done => {
    const balance = await getWeb3Public().getTokenBalance(aliceAddress, WEENUS.address);

    expect(balance).not.toBe(undefined);
    expect(balance.gt(0)).toBeTruthy();
    done();
  });

  it('allowance', async done => {
    const allowance = await getWeb3Public().getAllowance(WEENUS.address, bobAddress, aliceAddress);

    expect(allowance).not.toBe(undefined);
    expect(allowance.gte(0)).toBeTruthy();
    done();
  });

  it('gas limit calculation works', async done => {
    switch (blockchainName) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        {
          const gasFee = await getWeb3Public().getEstimatedGas(
            ERC20_TOKEN_ABI,
            WEENUS.address,
            'transfer',
            [bobAddress, '30'],
            aliceAddress
          );

          expect(gasFee?.gt(0)).toBeTruthy();
        }
        break;
      default:
        break;
    }

    done();
  });

  it('gas price calculation works', async done => {
    const gasPrice = await getWeb3Public().getGasPriceInETH();

    expect(gasPrice?.gt(0)).toBeTruthy();
    done();
  });

  it('get transaction gas fee works', async done => {
    let txHash;
    let txRealFee;
    switch (blockchainName) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        txHash = '0x95952a6d4fbdf941d2c4d57b173c33a2ec67c8cb0280c50499021ed933c778f3';
        txRealFee = 0.004341885;
        break;
      default:
        break;
    }
    const gasFee = await getWeb3Public().getTransactionGasFee(txHash);

    expect(gasFee.eq(txRealFee)).toBeTruthy();
    done();
  });

  it('call contract method works', async done => {
    const weenusSymbol = await getWeb3Public().callContractMethod(
      WEENUS.address,
      ERC20_TOKEN_ABI as AbiItem[],
      'symbol'
    );

    expect(weenusSymbol).toEqual(WEENUS.symbol);
    done();
  });

  it('is native address check works', () => {
    const isNativeAddress = getWeb3Public().isNativeAddress(ETH.address);

    expect(isNativeAddress).toBeTruthy();
  });

  it('get token info works correct', async done => {
    const weenus = coingeckoTestTokens.find(t => t.address === WEENUS.address);
    const tokenInfo = await getWeb3Public().getTokenInfo(WEENUS.address);

    expect(tokenInfo.symbol).toBe(weenus.symbol);
    expect(tokenInfo.decimals).toBe(weenus.decimals);

    done();
  });

  it('multicall get balance', async done => {
    const tokensAddresses = [WEENUS, YEENUS, XEENUS, ETH, WETH, WSATT].map(token => token.address);
    const balances = await getWeb3Public().getTokensBalances(aliceAddress, tokensAddresses);

    expect(Array.isArray(balances)).toBeTruthy();

    const realYEENUSBalance = await getWeb3Public().getTokenBalance(aliceAddress, YEENUS.address);
    const realETHBalance = await getWeb3Public().getBalance(aliceAddress, { inWei: true });

    expect(balances[1].eq(realYEENUSBalance)).toBeTruthy();
    expect(balances[3].eq(realETHBalance)).toBeTruthy();
    done();
  });
});
