import Sorter from "./Sorter";
import BubbleSorter from "./BubbleSorter";
import InsertionSorter from "./InsertionSorter";
import MergeSorter from "./MergeSorter";

export enum Sorters {
  BASE,
  BUBBLE_SORTER,
  INSERTION_SORTER,
  MERGE_SORTER
}

export type TSorterInfo = {
  name: string,
  algo: string,
};

export default class SorterFactory {
  public makeSorter(sorter?: Sorters, ...args: any): Sorter {
    switch (sorter) {
      case Sorters.BUBBLE_SORTER:
        return new BubbleSorter();
      case Sorters.INSERTION_SORTER:
        return new InsertionSorter();
      case Sorters.MERGE_SORTER:
        return new MergeSorter();
      default:
        return new Sorter();
    }
  }
  public getSorterName(sorter?: Sorters): TSorterInfo {
    switch (sorter) {
      case Sorters.BUBBLE_SORTER:
        return {
          name: "Bubble Sorter",
          algo: "Bubble Sort"
        };
      case Sorters.INSERTION_SORTER:
        return {
          name: "Insertion Sorter",
          algo: "Insertion Sort"
        };
      case Sorters.MERGE_SORTER:
        return {
          name: "Merge Sorter",
          algo: "Merge Sort"
        };
      default:
        return {
          name: "None",
          algo: "None",
        };
    }
  }
}