import './worker-polyfills';
import { PrivacycashInWorkerMsg, PrivacycashOutWorkerMsg } from './models/worker-models';
import { PrivacycashWorkerManager } from './worker-manager';

const workerManager = new PrivacycashWorkerManager();

addEventListener('message', ({ data }: { data: PrivacycashInWorkerMsg }) => {
  switch (data.type) {
    case 'init':
      console.debug('[PrivacycashWorker] init called');
      workerManager.setSignature(data.data.signature);
      workerManager.setLocalStorage(data.data.localStorageData);
      workerManager.resetAbortController();
      postMessage({ type: 'init' } as PrivacycashOutWorkerMsg);
      break;
    case 'getBalances':
      console.debug('[PrivacycashWorker] getBalances called');
      const tokensCount = data.tokens.length;
      let fetchedTokensCount = 0;
      data.tokens.forEach(token => {
        workerManager
          .getPrivacyCashBalance(token.address, data.walletAddr, data.useCache)
          .then(balanceWei => {
            const outMsgBalances: PrivacycashOutWorkerMsg = {
              type: 'getBalances',
              tokens: [{ ...token, balanceWei }]
            };
            postMessage(outMsgBalances);
          })
          .finally(() => {
            fetchedTokensCount++;
            if (fetchedTokensCount >= tokensCount) {
              const outMsg: PrivacycashOutWorkerMsg = {
                type: 'localStorageData',
                localStorageData: workerManager.localStorage.getStorageData()
              };
              postMessage(outMsg);
            }
          });
      });
      break;
    case 'stop':
      console.debug('[PrivacycashWorker] stop called');
      workerManager.abort();
      postMessage({ type: 'stop' } as PrivacycashOutWorkerMsg);
      break;
    default:
      const response = `Unknown data.type: ${(data as { type: string }).type}`;
      postMessage(response);
  }
});
