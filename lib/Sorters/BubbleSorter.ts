import Sorter, { ESortOpStages, ESortOps, IArrayElementInfo, TSortFnGenerator } from "./Sorter";

export default class BubbleSorter extends Sorter {
  public *sort(): TSortFnGenerator {
    yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.SORT);

    if (this.data.length < 1) {
      yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.SORT);
      return;
    };

    for (let iteration = 0, n = this.data.length; iteration < n; ++iteration) {
      for (let i = 1; i + iteration < n; ++i) {
        yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.SORT);

        let idx1 = i - 1;
        let element1: IArrayElementInfo = { index: idx1 };
        yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.ACCESS, [element1]);
        let val1 = this.data[idx1]; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.ACCESS, [element1]);
        yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.ACCESS, [element1]);

        let idx2 = i;
        let element2: IArrayElementInfo = { index: idx2 };
        yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.ACCESS, [element2]);
        let val2 = this.data[idx2]; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.ACCESS, [element2]);
        yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.ACCESS, [element2]);

        yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.COMPARE, [element1, element2]);
        let doSwap = val1 > val2; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.COMPARE, [element1, element2]);
        yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.COMPARE, [element1, element2]);

        if (doSwap) {
          yield this.makeSortFnYield(ESortOpStages.PRE, ESortOps.SWAP, [element1, element2]);
          [this.data[idx1], this.data[idx2]] = [this.data[idx2], this.data[idx1]]; yield this.makeSortFnYield(ESortOpStages.IN, ESortOps.SWAP, [element1, element2]);
          yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.SWAP, [element1, element2]);
        };
      };
      yield this.makeSortFnYield(ESortOpStages.NONE, ESortOps.DONE, [{index: n - iteration - 1}]);
    };
    this.sorted = true;
    yield this.makeSortFnYield(ESortOpStages.POST, ESortOps.SORT);
    return;
  };
};