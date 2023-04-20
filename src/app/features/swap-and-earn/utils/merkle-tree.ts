import { bufferToHex, keccak256 } from 'ethereumjs-util';

export default class MerkleTree {
  private static combinedHash(first: Buffer, second: Buffer): Buffer {
    if (!first) {
      return second;
    }
    if (!second) {
      return first;
    }

    return keccak256(MerkleTree.sortAndConcat(first, second));
  }

  private static getPairElement(idx: number, layer: Buffer[]): Buffer | null {
    const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;

    if (pairIdx < layer.length) {
      return layer[pairIdx];
    } else {
      return null;
    }
  }

  private static bufDedup(elements: Buffer[]): Buffer[] {
    return elements.filter((el, idx) => {
      return idx === 0 || !elements[idx - 1].equals(el);
    });
  }

  private static bufArrToHexArr(arr: Buffer[]): string[] {
    if (arr.some(el => !Buffer.isBuffer(el))) {
      throw new Error('Array is not an array of buffers');
    }

    return arr.map(el => '0x' + el.toString('hex'));
  }

  private static sortAndConcat(...args: Buffer[]): Buffer {
    return Buffer.concat([...args].sort(Buffer.compare));
  }

  private readonly elements = MerkleTree.bufDedup([...this.sourceElements].sort(Buffer.compare));

  private readonly bufferElementPositionIndex = this.elements.reduce<{
    [hexElement: string]: number;
  }>((memo, el, index) => {
    memo[bufferToHex(el)] = index;
    return memo;
  }, {});

  private readonly layers = this.getLayers(this.elements);

  constructor(private readonly sourceElements: Buffer[]) {}

  private getLayers(elements: Buffer[]): Buffer[][] {
    if (elements.length === 0) {
      throw new Error('empty tree');
    }

    const layers = [];
    layers.push(elements);

    while (layers[layers.length - 1].length > 1) {
      layers.push(this.getNextLayer(layers[layers.length - 1]));
    }

    return layers;
  }

  private getNextLayer(elements: Buffer[]): Buffer[] {
    return elements.reduce<Buffer[]>((layer, el, idx, arr) => {
      if (idx % 2 === 0) {
        layer.push(MerkleTree.combinedHash(el, arr[idx + 1]));
      }

      return layer;
    }, []);
  }

  public getProof(el: Buffer): Buffer[] {
    let idx = this.bufferElementPositionIndex[bufferToHex(el)];

    if (typeof idx !== 'number') {
      throw new Error('Element does not exist in Merkle tree');
    }

    return this.layers.reduce((proof, layer) => {
      const pairElement = MerkleTree.getPairElement(idx, layer);

      if (pairElement) {
        proof.push(pairElement);
      }

      idx = Math.floor(idx / 2);

      return proof;
    }, []);
  }

  public getHexProof(el: Buffer): string[] {
    const proof = this.getProof(el);

    return MerkleTree.bufArrToHexArr(proof);
  }
}
