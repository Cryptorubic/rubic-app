import { generateCrossContractCallsProof } from '@railgun-community/wallet';

addEventListener('message', async ({ data }) => {
  const { type, payload } = data;

  if (type === 'GENERATE_PROOF') {
    try {
      // @ts-ignore
      const proof = await generateCrossContractCallsProof(...payload);

      // Отправляем результат обратно в основной поток
      postMessage({ type: 'PROOF_GENERATED', payload: proof });
    } catch (error) {
      postMessage({ type: 'ERROR', payload: error });
    }
  }
});
