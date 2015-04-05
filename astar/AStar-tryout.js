///<reference path="../lib/node.d.ts"/>
///<reference path="../lib/collections.d.ts"/>
var C = require('../lib/collections');
var AS;
(function (AS) {
    function key(state, cost) {
        return state.toNumber() + cost;
    }
    AS.key = key;
    var PuzzleStateNode = (function () {
        function PuzzleStateNode() {
            this.next = null; // (ids) list of possible nodes to walk to
        }
        PuzzleStateNode.prototype.getNeighbours = function () {
            if (this.next == null) {
                this.createNeighbours();
            }
            return this.next;
        };
        PuzzleStateNode.prototype.createNeighbours = function () {
            //find 0
            var posx;
            var posy;
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    if (this.state.puzzle[i][j] == 0) {
                        posx = i;
                        posy = j;
                        break;
                    }
                }
            }
            var ret = [];
            /*      if(posx == 0){
                //add new puzzleStates
                var foo = switch(this.state, posx, posy, posx + 1, posy);
                ret.push(switch(this.state, posx, posy, posx + 1, posy));
                  } else if(posx == 2) {
                ret.push(switch(state, posx, posy, posx - 1, posy));
                  } else {
                ret.push(switch(state, posx, posy, posx + 1, posy));
                ret.push(switch(state, posx, posy, posx - 1, posy));
                  }
            
                  if(posy == 0){
                ret.push(switch(state, posx, posy, posx, posy +	1));
                  } else if(posy == 2) {
                ret.push(switch(state, posx, posy, posx, posy - 1));
                  } else {
                ret.push(switch(state, posx, posy, posx, posy + 1));
                ret.push(switch(state, posx, posy, posx, posy - 1));
                  }*/
        };
        PuzzleStateNode.prototype.switch = function (base, x1, y1, x2, y2) {
            var tmp = base[x1][y1];
            base[x1][y1] = base[x2][y2];
            base[x2][y2] = tmp;
            return base;
        };
        return PuzzleStateNode;
    })();
    AS.PuzzleStateNode = PuzzleStateNode;
    var CityStateNode = (function () {
        function CityStateNode(state, prev, next, cost) {
            if (cost === void 0) { cost = 0; }
            this.state = state;
            this.prev = prev;
            this.next = next;
            this.cost = cost;
        }
        CityStateNode.prototype.setNeighbour = function (nNode, dist) {
            this.next.push([nNode, dist]);
        };
        CityStateNode.prototype.getNeighbours = function () {
            return this.next;
        };
        return CityStateNode;
    })();
    AS.CityStateNode = CityStateNode;
    // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    // Helper function to enable easier toNumber implementation for Heuristic type
    function hash(s) {
        var hash = 0;
        if (s.length == 0)
            return hash;
        for (var i = 0; i < s.length; i++) {
            var chr = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
    AS.hash = hash;
    /*
     * AStar simple implementation. Requires an implementation of Heuristic and ANode.
     * TODO: Cycle checking: Keep record of visited nodes for termination and dont
     * expand (add to PQ if they are already visited)
     * TODO: Multiple path pruning: Keep redord of paths to visitied nodes and their
     * cost. If a new path is cheaper exchange the old path with the new one.
     * TODO: If h satisfies the monotone restriction (h(m) - h(n) < cost(m, n))
     * then, A* with multiple path pruning always finds the shortest path to a goal.
     */
    function search(start, goal) {
        var frontier = new C.collections.PriorityQueue(compClosure(goal));
        frontier.enqueue(start);
        while (!frontier.isEmpty()) {
            var n = frontier.dequeue();
            if (n) {
                if (n.state.match(goal)) {
                    return path(n);
                }
                var neighbours = n.getNeighbours();
                for (var i = 0; i < neighbours.length; i++) {
                    var _neighbour = neighbours[i];
                    frontier.enqueue(_neighbour[0]);
                }
            }
            else {
                throw "Node undefined";
            }
        }
    }
    AS.search = search;
    ;
    //////////////////////////////////////////////////////////////////////
    // private functions
    function compClosure(goal) {
        /*
         * Comparing function
         */
        function compare(a, b) {
            // cost = g + h
            var aCost = a.cost + a.state.heuristic(goal);
            var bCost = b.cost + b.state.heuristic(goal);
            var res;
            if (aCost < bCost)
                res = 1;
            else if (aCost > bCost)
                res = -1;
            else
                res = 0;
            return res;
        }
        return compare;
    }
    /*
     * extracts the path from the ANode back to start node
     */
    function path(n) {
        var _path = [];
        var _n = n;
        while (_n != null) {
            _path.push(_n.state);
            _n = _n.prev;
        }
        return _path.reverse();
    }
})(AS = exports.AS || (exports.AS = {}));
