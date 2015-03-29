///<reference path="./Search"/>
///<reference path="./Heuristic"/>
///<reference path="../lib/collections"/>

module Search {

  export function aStar<N>( heuristic?:  Heuristic
                          , nodeEquals?: (a: N, b:N) => boolean
                          , nodeShow?:   (a: N)      => string
                          ) : Search {

    return function ( neighbours: (node: N) => [N, number]
                    , start: N
                    , end: (node: N) => boolean
                    ) : N[] {
      var h :(node: N) => number = heuristic || zeroHeuristic;

      // "Open set", the nodes that should be evaluated.
      var open = new collections.PriorityQueue<[N, number]>(itemCompareFunction);

      var info = new collections.Dictionary<N, AStarInfo<N>>(nodeShow);

      // Add the start node to the open set.
      open.add([start, 0]);

      // Initialize the info of the start node.
      info.setValue(start, {
        open: true,
        closed: false,
        parent: undefined,
        f: h(start),
        g: 0,
        h: h(start),
      });

      var current: N;
      do {
        // Use the most promising node from the open set.
        current = open.dequeue()[0];

        // We're done if it is one of the nodes we are looking for.
        if ( end(current) ) {
          return buildPath(info, current);
        }

        // Move the current node from the open to the closed set.
        var ci: AStarInfo<N> = info.getValue(current);

        ci.open = false;
        ci.closed = true;

        info.setValue(current, ci);

        // Iterate over the neighbours of the current node.
        var ni: AStarInfo<N>;
        for ( var neighbour in neighbours(current) ) {
          // Extract the node and cost from the neighbour.
          var n: N = neighbour[0];
          var cost: number = neighbour[1];

          // Retrieve the info associated with the neighbour.
          ni = info.getValue(n);

          // If there's no info associated with the neighbour,
          // then we have not seen it before. We initialize the
          // information with appropriate values.
          if ( !ni ) {
            ni = {
              open: true,
              closed: false,
              parent: current,
              f: ci.g + cost + h(current),
              g: ci.g + cost,
              h: h(current)
            }
          } else { // We have seen the node before

            // If the node is in the closed set, then continue with
            // the next neighbour,
            if ( ni.closed ) {
              continue;
            }

            // Update the information if the current path is better
            // than the last.
            if ( ci.g + cost < ni.g ) {
              ni.open = true;
              ni.parent = current;
              ni.g = ci.g + cost;
              ni.f = ni.g + ni.h;
            }
          }

          // Add the neighbour to the priority queue if its in the open set.
          if ( ni.open ) {
            open.add([n, ni.f]);
          }

          // Store the update information.
          info.setValue(n, ni);
        }

      } while ( !open.isEmpty() );

      // Error, no end node was found!
      return undefined
    }
  }

  function buildPath<N>(info: collections.Dictionary<N,AStarInfo<N>>, N) : N[] {
    return undefined;
  }

  function itemCompareFunction<N>(a: N, b: N): number {
    if (a[1] < b[1]) {
      return -1;
    } else if (a[1] > b[1]) {
      return 1;
    } else {
      return 0;
    }
  }

  interface AStarInfo<N> {
    open:   boolean;
    closed: boolean;
    parent: N;
    f:      number;
    g:      number;
    h:      number;
  }
}

