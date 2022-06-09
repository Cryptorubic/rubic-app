import { TransactionReceipt } from 'web3-eth';
import { AbiItem, sha3, AbiInput } from 'web3-utils';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

interface DecodedLogData {
  name: string;
  type: string;
  value?: string;
}

interface DecodedLog {
  name: string;
  address: string;
  params: DecodedLogData[];
}

function typeToString(input: AbiInput): string {
  if (input.type === 'tuple') {
    return '(' + input.components.map(typeToString).join(',') + ')';
  }
  return input.type;
}

export function decodeLogs(abi: AbiItem[], receipt: TransactionReceipt): DecodedLog[] {
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

  const decodedLogs = logs.map(logItem => {
    const methodID = logItem.topics[0].slice(2);
    const method = methodIds[methodID];

    if (method) {
      const logData = logItem.data;
      let decodedParams: Array<DecodedLogData> = [];
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
        let decodedLogData: DecodedLogData = {
          name: param.name,
          type: param.type
        };

        if (param.indexed) {
          decodedLogData.value = logItem.topics[topicsIndex];
          topicsIndex++;
        } else {
          decodedLogData.value = decodedData[dataIndex];
          dataIndex++;
        }

        if (param.type === 'address') {
          decodedLogData.value = decodedLogData.value.toLowerCase();
          // 42 because len(0x) + 40
          if (decodedLogData.value.length > 42) {
            let toRemove = decodedLogData.value.length - 42;
            let temp = decodedLogData.value.split('');
            temp.splice(2, toRemove);
            decodedLogData.value = temp.join('');
          }
        }

        if (param.type === 'uint256' || param.type === 'uint8' || param.type === 'int') {
          // ensure to remove leading 0x for hex numbers
          if (typeof decodedLogData.value === 'string' && decodedLogData.value.startsWith('0x')) {
            decodedLogData.value = new BigNumber(decodedLogData.value.slice(2), 16).toString(10);
          } else {
            decodedLogData.value = new BigNumber(decodedLogData.value).toString(10);
          }
        }

        decodedParams.push(decodedLogData);
      });

      return {
        name: method.name,
        params: decodedParams,
        address: logItem.address
      };
    }
  });

  return decodedLogs;
}
