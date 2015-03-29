
module Search {
  export type Heuristic = <N>(node: N) => number;

  export function zeroHeuristic<N>(node: N): number {
    return 0;
  }
}
