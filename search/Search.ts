
module Search {
  export interface Search<N, Path> {
    ( neighbours: (node: N) => [N, number][]
    , start: N
    , end: (node: N) => boolean
    ): Path;
  }
}

