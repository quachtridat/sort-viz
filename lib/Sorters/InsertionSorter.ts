import Sorter, { IArrayElementInfo, ESortOpStages, ESortOps, TSortFnGenerator } from './Sorter'

export default class InsertionSorter extends Sorter {
  public *sort(): TSortFnGenerator {
    yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.SORT);

    if (this.data.length < 1) {
      yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.SORT);
      return;
    };

    // In insertion sort, the first element is initially considered good (in its correct position)
    yield this.makeSortFnYield(ESortOpStages.NONE, ESortOps.DONE, [{index: 0}]);

    for (let i: number = 1, n: number = this.data.length; i < n; ++i) {
      for (let j: number = i; j > 0; --j) {
        yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.SORT);

        // Access the current element
        let idx1: number = j;
        let elem1: IArrayElementInfo = {index: idx1};
        yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.ACCESS, [elem1]);

        let data1 = this.data[idx1]; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.ACCESS, [elem1]);

        yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.ACCESS, [elem1]);

        // Access the preceding element
        let idx2: number = j - 1;
        let elem2: IArrayElementInfo = {index: idx2};
        yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.ACCESS, [elem2]);

        let data2 = this.data[idx2]; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.ACCESS, [elem2]);

        yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.ACCESS, [elem2]);

        // Compare the two elements
        let doSwap: boolean = false;
        yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.COMPARE, [elem1, elem2]);

        doSwap = data1 < data2; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.COMPARE, [elem1, elem2]);

        yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.COMPARE, [elem1, elem2]);

        // Swap the two elements
        if (doSwap) {
          yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.SWAP, [elem1, elem2]);

          [this.data[idx1], this.data[idx2]] = [this.data[idx2], this.data[idx1]]; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.SWAP, [elem1, elem2]);

          yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.SWAP, [elem1, elem2]);
        } else break;
      };
      yield this.makeSortFnYield(ESortOpStages.NONE, ESortOps.DONE, [{index: i}]);
    };

    this.sorted = true;
    yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.SORT);
  };
};