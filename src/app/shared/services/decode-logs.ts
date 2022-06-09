import { TransactionReceipt } from 'web3-eth';
import { AbiItem, sha3, AbiInput } from 'web3-utils';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

function typeToString(input: AbiInput): string {
  if (input.type === 'tuple') {
    return '(' + input.components.map(typeToString).join(',') + ')';
  }
  return input.type;
}

export function decodeLogs(
  abi: AbiItem[],
  receipt: TransactionReceipt
): { name: string; address: string; params: { name: string; type: string; value?: string }[] }[] {
  const methodIds: Record<string, AbiItem> = {};

  for (let abiItem of abi) {
    if (abiItem.name) {
      const sig = sha3(abiItem.name + '(' + abiItem.inputs.map(typeToString) + ')');

      if (abiItem.type === 'event') {
        methodIds[sig.slice(2)] = abiItem;
      }
    }
  }

  const logs = receipt.logs.filter(log => log.topics.length > 0);
  const abiCoder = new Web3().eth.abi;

  const m = logs.map(logItem => {
    const methodID = logItem.topics[0].slice(2);
    const method = methodIds[methodID];

    if (method) {
      const logData = logItem.data;
      let decodedParams: { name: string; type: string; value?: string }[] = [];
      let dataIndex = 0;
      let topicsIndex = 1;

      let dataTypes: string[] = [];

      for (let input of method.inputs) {
        if (!input.indexed) {
          dataTypes.push(input.type);
        }
      }

      const decodedData = abiCoder.decodeParameters(dataTypes, logData.slice(2));

      // Loop topic and data to get the params
      method.inputs.forEach(function (param): void {
        let decodedP: { name: string; type: string; value?: string } = {
          name: param.name,
          type: param.type
        };

        if (param.indexed) {
          decodedP.value = logItem.topics[topicsIndex];
          topicsIndex++;
        } else {
          decodedP.value = decodedData[dataIndex];
          dataIndex++;
        }

        if (param.type === 'address') {
          decodedP.value = decodedP.value.toLowerCase();
          // 42 because len(0x) + 40
          if (decodedP.value.length > 42) {
            let toRemove = decodedP.value.length - 42;
            let temp = decodedP.value.split('');
            temp.splice(2, toRemove);
            decodedP.value = temp.join('');
          }
        }

        if (param.type === 'uint256' || param.type === 'uint8' || param.type === 'int') {
          // ensure to remove leading 0x for hex numbers
          if (typeof decodedP.value === 'string' && decodedP.value.startsWith('0x')) {
            decodedP.value = new BigNumber(decodedP.value.slice(2), 16).toString(10);
          } else {
            decodedP.value = new BigNumber(decodedP.value).toString(10);
          }
        }

        decodedParams.push(decodedP);
      });

      return {
        name: method.name,
        params: decodedParams,
        address: logItem.address
      };
    }
  });

  return m;
}
