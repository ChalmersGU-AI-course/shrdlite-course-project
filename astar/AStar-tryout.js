///<reference path="../lib/node.d.ts"/>
///<reference path="collections.d.ts"/>
var C = require('./collections');
var AS;
(function (AS) {
    var Graph = (function () {
        function Graph() {
            this.table = [];
        }
        Graph.prototype.set = function (node) {
            var k = key(node.state, node.cost);
            this.table[k] = node;
            return node;
        };
        Graph.prototype.get = function (k) {
            return this.table[k];
        };
        return Graph;
    })();
    AS.Graph = Graph;
    function key(state, cost) {
        return state.toNumber() + cost;
    }
    AS.key = key;
    var ANode = (function () {
        function ANode(state, prev, next, cost) {
            if (cost === void 0) { cost = 0; }
            this.state = state;
            this.prev = prev;
            this.next = next;
            this.cost = cost;
        }
        return ANode;
    })();
    AS.ANode = ANode;
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
    function search(start, goal, graph) {
        var frontier = new C.collections.PriorityQueue(compClosure(goal));
        frontier.enqueue(start);
        while (!frontier.isEmpty()) {
            var n = frontier.dequeue();
            if (n) {
                if (n.state.match(goal)) {
                    return path(n, graph);
                }
                for (var i = 0; i < n.next.length; i++) {
                    var _neighbour = graph.get(n.next[i]);
                    frontier.enqueue(_neighbour);
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
    function path(n, graph) {
        var _path = [];
        var _n = n;
        while (_n != null) {
            _path.push(_n.state);
            _n = graph.get(_n.prev);
        }
        return _path.reverse();
    }
})(AS = exports.AS || (exports.AS = {}));
