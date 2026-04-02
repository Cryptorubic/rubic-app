/// <reference lib="webworker" />

import './hinkal-worker-polyfills';

import { HinkalWorkerLogic } from './services/hinkal-worker-logic';
import {
  DepositParams,
  InitParams,
  QuoteParams,
  SwapParams,
  SwitchNetworkParams,
  TransferParams,
  WithdrawParams,
  WorkerParams
} from './models/worker-params';
import { Mutex } from 'async-mutex';
import { EventType } from '@hinkal/common';

const hinkalWorkerLogic = new HinkalWorkerLogic();
const mutex = new Mutex();

process.on('message', async (event: { type: string }) => {
  if (event.type === EventType.BalanceChange) {
    console.log('BALANCE CHANGED EVENT', event);

    await mutex.runExclusive(async () => {
      try {
        const balances = await hinkalWorkerLogic.balanceService.getBalances();
        postMessage({ success: true, result: balances, type: 'updateBalance' });
      } catch {}
    });
  }
});

addEventListener('message', async ({ data }: { data: WorkerParams }) => {
  await mutex.runExclusive(async () => {
    try {
      const { type, params } = data;

      if (type === 'init') {
        const { address, chainId, signature } = params as InitParams;
        await hinkalWorkerLogic.snapshotService.updateInstance(address, chainId, signature);
        postMessage({ result: null, type, success: true });
      }

      if (type === 'switchNetwork') {
        const { address, chainId } = params as SwitchNetworkParams;
        await hinkalWorkerLogic.snapshotService.switchNetwork(chainId, address);
        postMessage({ success: true, result: null, type });
      }

      if (type === 'updateBalance') {
        const balances = await hinkalWorkerLogic.balanceService.getBalances();
        postMessage({ success: true, result: balances, type });
      }

      if (type === 'withdraw') {
        const { token, receiver } = params as WithdrawParams;
        const resp = await hinkalWorkerLogic.swapService.withdraw(token, receiver);
        postMessage({ success: true, result: resp, type });
      }

      if (type === 'deposit') {
        const { token } = params as DepositParams;
        const resp = await hinkalWorkerLogic.swapService.deposit(token);
        postMessage({ success: true, result: resp, type });
      }

      if (type === 'transfer') {
        const { token, receiver } = params as TransferParams;
        const resp = await hinkalWorkerLogic.swapService.privateTransfer(token, receiver);
        postMessage({ success: true, result: resp, type });
      }

      if (type === 'quote') {
        const { fromAsset, toAsset, fromTokenStringAmount } = params as QuoteParams;
        const resp = await hinkalWorkerLogic.quoteService.fetchQuote(
          fromAsset,
          toAsset,
          fromTokenStringAmount
        );
        postMessage({ success: true, result: resp, type });
      }

      if (type === 'swap') {
        const { fromToken, toToken } = params as SwapParams;
        const resp = await hinkalWorkerLogic.swapService.privateSwap(fromToken, toToken);
        postMessage({ success: true, result: resp, type: type });
      }

      if (type === 'stop') {
        await hinkalWorkerLogic.snapshotService.clearSnapshotsInterval();
        postMessage({ success: true, result: null, type: type });
      }
    } catch (err) {
      console.log('WORKER ERROR', err);
      postMessage({
        success: false,
        error: err instanceof Error ? err.message : JSON.stringify(err),
        type: data.type
      });
    }
  });
});
