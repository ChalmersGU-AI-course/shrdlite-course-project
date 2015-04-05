///<reference path="../lib/node.d.ts"/>
///<reference path="collections.d.ts"/>
var C = require('./collections');
var AS;
(function (AS) {
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
        PuzzleStateNode.prototype.equals = function (a) {
            return true;
        };
        return PuzzleStateNode;
    })();
    AS.PuzzleStateNode = PuzzleStateNode;
    var CityStateNode = (function () {
        function CityStateNode(state, prev, next) {
            this.state = state;
            this.prev = prev;
            this.next = next;
            this.cost = 0;
        }
        CityStateNode.prototype.setNeighbour = function (nNode, dist) {
            this.next.push([nNode, dist]);
        };
        CityStateNode.prototype.getNeighbours = function () {
            return this.next;
        };
        CityStateNode.prototype.toString = function () {
            var f = this.cost + this.state.h;
            return this.state.toString() + " " + this.cost + " " + this.state.h + " " + f;
        };
        CityStateNode.prototype.equals = function (a) {
            return a.state.name == this.state.name;
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
            frontier.forEach(function (element) {
                console.log(element.toString());
            });
            console.log("TOP: " + frontier.peek().toString());
            var n = frontier.dequeue();
            console.log("dequeuing " + n.toString());
            console.log("------");
            if (n) {
                if (n.state.match(goal)) {
                    return path(n);
                }
                var neighbours = n.getNeighbours();
                for (var i = 0; i < neighbours.length; i++) {
                    var _neighbour = neighbours[i];
                    _neighbour[0].cost = n.cost + _neighbour[1];
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
            console.log("DEBUG");
            console.log(a.state.toString() + " " + aCost);
            console.log(b.state.toString() + " " + bCost);
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
    function removeElement(el, oldPQ) {
        var newPQ = new C.collections.PriorityQueue();
        while (!oldPQ.isEmpty()) {
            var t = oldPQ.dequeue();
            if (t.equals(el)) {
                newPQ.enqueue(oldPQ.dequeue());
            }
        }
        return newPQ;
    }
})(AS = exports.AS || (exports.AS = {}));
