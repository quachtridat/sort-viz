import * as Helper from '@/lib/helper'

export interface IArrayElementInfo {
  index: number;
  value?: number;
}

export enum ESortOps { NONE, ACCESS, COMPARE, SWAP, SORT, DONE, }

export enum ESortOpStages { NONE, PRE, IN, POST }

export interface ISorterEvent {
  event_type: {
    stage: ESortOpStages,
    op: ESortOps
  };
  elems: IArrayElementInfo[];
}

export type TSortFnYield = ISorterEvent;
export type TSortFnRet = void;

export type TSortFnGenerator = Generator<TSortFnYield, TSortFnRet>;

export default class Sorter {
  protected data: number[] = [];
  protected sorted: boolean = false;

  public n_elements(): number {
    return this.data.length;
  }

  public generate(n: number, minVal: number = 1, maxVal: number = 100): Sorter {
    n = Math.round(n);
    if (n > 0) {
      this.data = Array();
      for (let i = 0; i < n; ++i) this.data.push(Helper.getRandomIntInclusive(minVal, maxVal));
      this.sorted = false;
    }
    return this;
  }

  public populate(arr: number[], isSorted: boolean = false): Sorter {
    this.data = arr;
    this.sorted = isSorted;
    return this;
  }

  public get_data() {
    return this.data;
  }

  public values() {
    return this.data.values;
  }

  protected makeSortFnYield(stage: ESortOpStages = ESortOpStages.NONE, op: ESortOps = ESortOps.NONE, elems: IArrayElementInfo[] = []): TSortFnYield {
    return {
      event_type: {
        stage: stage,
        op: op,
      },
      elems: elems,
    };
  }

  public *sort(): TSortFnGenerator {
    // NOT IMPLEMENTED
    yield {
      elems: [],
      event_type: {
        op: ESortOps.NONE,
        stage: ESortOpStages.NONE
      }
    };
    return;
  }
}