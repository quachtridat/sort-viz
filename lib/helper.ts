export function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

export const range = (start: number, stop: number, step: number, stopExclusive = true): Array<number> => Array.from({ length: (stop - (stopExclusive ? 1 : 0) - start) / step + 1}, (_, i) => start + (i * step));
export const rangeFn = <T1, T2>(start: number, stop: number, step: number, fn: (v: T1, idx: number) => T2, stopExclusive = true): Array<T2> => Array.from<T1, T2>({ length: (stop - (stopExclusive ? 1 : 0) - start) / step + 1}, (v, i) => fn(v, start + (i * step)));