///<reference path="./Search"/>
///<reference path="./Heuristic"/>
///<reference path="../lib/collections"/>

module Search {
  export function aStar<N>( heuristic?: Heuristic<N>
                          , key?: (a: N) => string
                          , stats: AStarStats = {
                              nodesVisited: 0,
                              nodesAdded: 0
                            }
                          ) : Search<N, N[]> {

    return function ( neighbours: (node: N) => [N, number][]
                    , start: N
                    , end: (node: N) => boolean
                    ) : N[] {
      var h: (node: N) => number = heuristic || zeroHeuristic;

      // "Open set", the nodes that should be evaluated.
      var open = new collections.PriorityQueue<[N, number]>(itemCompareFunction);
      // Information associated with each node.
      var info = new collections.Dictionary<N, AStarInfo<N>>(key);

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

        var ci: AStarInfo<N> = info.getValue(current);

        // Never mind if the node is already in the closed set.
        if (ci.closed) {
          continue;
        }

        // Move the current node from the open to the closed set.
        ci.closed = true;

        stats.nodesVisited += 1;

        // Iterate over the neighbours of the current node.
        var ni: AStarInfo<N>;
        var ns: [N, number][] = neighbours(current);
        for ( var i in ns ) {
          // Extract the node and cost from the neighbour.
          var n: N = ns[i][0];
          var cost: number = ns[i][1];

          // Retrieve the info associated with the neighbour.
          ni = info.getValue(n);

          // If there's no info associated with the neighbour,
          // then we have not seen it before. We initialize the
          // information with appropriate values.
          if ( !ni ) {
            ni = {
              closed: false,
              parent: current,
              f: ci.g + cost + h(n),
              g: ci.g + cost,
              h: h(n)
            }

            // Add the new node to the open set
            stats.nodesAdded += 1;
            open.add([n, ni.f]);
            info.setValue(n, ni);
          } else { // We have seen the node before

            // If the node is in the closed set, then continue with
            // the next neighbour,
            if ( ni.closed ) {
              continue;
            }

            // Update the information if the current path is better
            // than the last.
            if ( ci.g + cost < ni.g ) {
              ni.parent = current;
              ni.g = ci.g + cost;
              ni.f = ci.g + cost + ni.h;

              // Add the updated node to the open set
              stats.nodesAdded += 1;
              open.add([n, ni.f]);
            }
          }
        }
      } while ( !open.isEmpty() );

      // Error, no end node was found!
      return undefined
    }
  }

  function buildPath<N>(info: collections.Dictionary<N,AStarInfo<N>>, node: N) : N[] {
    var ns: N[] = [];
    var n: N = node;
    var i: AStarInfo<N> = info.getValue(n);
    while ( i.parent ) {
      ns.push(n);
      n = i.parent;
      i = info.getValue(n);
    }
    ns.push(n);

    return ns.reverse();
  }

  function itemCompareFunction<N>(a: N, b: N): number {
    return b[1] - a[1];
  }

  interface AStarInfo<N> {
    closed: boolean;
    parent: N;
    f:      number;
    g:      number;
    h:      number;
  }

  export interface AStarStats {
    nodesVisited: number;
    nodesAdded: number;
  }
}

