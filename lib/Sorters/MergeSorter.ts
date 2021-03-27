import Sorter, {IArrayElementInfo, ESortOpStages, ESortOps, TSortFnGenerator, TSortFnYield} from './Sorter';
import { range } from '@/lib/helper';

export default class MergeSorter extends Sorter {
  protected *merge(part1: {startIdx: number, endIdx: number}, part2: {startIdx: number, endIdx: number}): Generator<TSortFnYield, IArrayElementInfo[]> {
    let arr: IArrayElementInfo[] = [];
    
    let idx1: number = part1.startIdx;
    let idx2: number = part2.startIdx;
    
    while (idx1 <= part1.endIdx && idx2 <= part2.endIdx) {
      let elem1: IArrayElementInfo = {index: idx1};
      let elem2: IArrayElementInfo = {index: idx2};

      yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.ACCESS, [elem1]);
      let data1 = this.data[idx1]; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.ACCESS, [elem1]);
      yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.ACCESS, [elem1]);
      
      yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.ACCESS, [elem2]);
      let data2 = this.data[idx2]; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.ACCESS, [elem2]);
      yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.ACCESS, [elem2]);

      yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.COMPARE, [elem1, elem2]);
      if (data1 <= data2) {
        yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.COMPARE, [elem1, elem2]);
        arr.push({index: idx1++, value: data1});
      } else {
        yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.COMPARE, [elem1, elem2]);
        arr.push({index: idx2++, value: data2});
      }
      yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.COMPARE, [elem1, elem2]);
    }
    
    while (idx1 <= part1.endIdx) {
      let elem1: IArrayElementInfo = {index: idx1};

      yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.ACCESS, [elem1]);
      let data1 = this.data[idx1]; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.ACCESS, [elem1]);
      yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.ACCESS, [elem1]);

      arr.push({index: idx1++, value: data1});
    }

    while (idx2 <= part2.endIdx) {
      let elem2: IArrayElementInfo = {index: idx2};

      yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.ACCESS, [elem2]);
      let data2 = this.data[idx2]; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.ACCESS, [elem2]);
      yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.ACCESS, [elem2]);

      arr.push({index: idx2++, value: data2});
    }

    return arr;
  }

  protected *mergeSort(startIdx: number, endIdx: number): TSortFnGenerator {
    yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.SORT);

    if (startIdx >= endIdx) return;

    let n = endIdx - startIdx + 1;

    let mid = startIdx + (n >> 1);

    let part1 = {
      startIdx: startIdx,
      endIdx: mid - 1,
    };

    let part2 = {
      startIdx: mid,
      endIdx: endIdx
    };

    yield *this.mergeSort(part1.startIdx, part1.endIdx);
    yield *this.mergeSort(part2.startIdx, part2.endIdx);

    let merged = yield *this.merge(part1, part2);

    for (let idx = 0, idxLim = merged.length; idx < idxLim; ++idx) {
      let val = merged[idx];
      if (val.value) {
        let elem: IArrayElementInfo = {index: startIdx + idx};
        yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.ACCESS, [elem]);
        this.data[startIdx + idx] = val.value; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.ACCESS, [elem]);
        yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.ACCESS, [elem]);
      } else console.error("This should not happen D:");
    }

    yield this.makeSortFnYield(ESortOpStages.NONE, ESortOps.DONE, [...range(startIdx, endIdx, 1, false)].map(idx => {
      return {
        index: idx,
      }
    }));

    return;
  }

  public *sort(): TSortFnGenerator {
    yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.SORT);

    if (this.data.length < 1) {
      yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.SORT);
      return;
    }

    yield *this.mergeSort(0, this.data.length - 1);

    yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.SORT);
    return;
  }
}