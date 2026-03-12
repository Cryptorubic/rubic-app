/// <reference lib="webworker" />

import './hinkal-worker-polyfills';

import { HinkalWorkerLogic } from './hinkal-worker-logic';
import { WorkerParams } from './models/worker-params';

const hinkalWorkerLogic = new HinkalWorkerLogic();

addEventListener('message', async ({ data }: { data: WorkerParams }) => {
  try {
    const { signature, chainId, address, type } = data;

    if (type === 'init') {
      await hinkalWorkerLogic.updateInstance(address, chainId, signature);
      await hinkalWorkerLogic.switchSnapshot(chainId);
      postMessage({ result: null, type: 'init', success: true });
    }

    if (type === 'fetchBalance') {
      const balances = await hinkalWorkerLogic.fetchBalances(chainId, address);
      postMessage({ success: true, result: balances, type: 'fetchBalance' });
    }

    if (type === 'switchNetwork') {
      await hinkalWorkerLogic.switchNetwork(chainId, address);
      postMessage({ success: true, result: null, type: 'switchNetwork' });
    }
  } catch (err) {
    console.log('WORKER ERROR', err);
    postMessage({ success: false, result: null, type: data.type });
  }
});
