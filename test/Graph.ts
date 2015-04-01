interface N {
  value: string;
  x: number;
  y: number;
  neighbours: [N, number][];
}

function graph( map: boolean[][], xDim?: number, yDim?: number
              , xAxis = true, yAxis = true, diags = true ): N[][] {
  var yd = yDim || map.length;
  var xd = xDim || yd > 0 ? map[0].length : 0;
  var nodes = [];

  function initNodes() {
    for ( var y=0; y<yd; y++) {
      var xs: N[] = [];
      for ( var x=0; x<xd; x++) {
        xs.push( { value: "N[" + y + "][" + x + "]"
                 , x: x
                 , y: y
                 , neighbours: [] } );
      }
      nodes.push(xs);
    }
  }

  function buildEdges() {
    var ok = (x, y) => x >= 0 && x < xd && y >= 0 && y < yd && map[y][x];

    var edge = (x, y, u, v, c) => {
      if ( ok(x, y) && ok(u, v) ) {
        nodes[y][x].neighbours.push([nodes[v][u], c]);
      }
    }

    for ( var y=0; y<yd; y++) {
      for ( var x=0; x<xd; x++) {
        if ( xAxis ) {
          edge(x, y, x-1, y, 1)
          edge(x, y, x+1, y, 1)
        }

        if ( yAxis ) {
          edge(x, y, x, y-1, 1)
          edge(x, y, x, y+1, 1)
        }

        if ( diags ) {
          var d = Math.sqrt(2);
          edge(x, y, x-1, y-1, d)
          edge(x, y, x-1, y+1, d)
          edge(x, y, x+1, y-1, d)
          edge(x, y, x+1, y+1, d)
        }
      }
    }
  }

  initNodes();
  buildEdges();

  return nodes;
}

function printGraph(map: boolean[][], path: N[]) {
  for ( var y in map ) {
    var str = "";
    for ( var x in map[y] ) {
      var b = false;
      for (var p in path) {
        b = b || (path[p].x == x && path[p].y == y);
      }

      if ( b ) {
        str += "+"
      } else {
        str += map[y][x] ? " " : "▮"
      }
    }

    console.log(str);
  }
}

