///<reference path="collections.ts"/>
///<reference path="graph.ts"/>
var AStar;
(function (AStar) {
    //helper function for priority queue to keep it sorted from lowest F to highest
    function compareCost(first, second) {
        if (first.getF() < second.getF()) {
            return 1;
        }
        else if (first.getF() > second.getF()) {
            return -1;
        }
        return 0;
    }
    var AStarSearch = (function () {
        function AStarSearch(g) {
            this.openList = new collections.Dictionary();
            this.closeList = new collections.Dictionary();
            this.priQueue = new collections.PriorityQueue(compareCost);
            this.graphs = g;
        }
        //calculate manhattan's distance from 2 position
        AStarSearch.prototype.calMD = function (from, to) {
            var fromVtx = this.graphs.getVertex(from).getCoor();
            var toVtx = this.graphs.getVertex(to).getCoor();
            return Math.abs(fromVtx.posX - toVtx.posX) + Math.abs(fromVtx.posY - toVtx.posY);
        };
        //convert result from runSearchAstar to string that easier to read on HTML
        AStarSearch.prototype.printPath = function (as) {
            var temp = "";
            for (var i = 0; i < as.length; i++) {
                if (i == 0) {
                    temp += "Start : " + as[i] + "</br>";
                }
                else if (i == as.length - 1) {
                    temp += "Goal : " + as[i] + "</br>";
                }
                else {
                    temp += "Goto : " + as[i] + "</br>";
                }
            }
            return temp;
        };
        //search a star 
        AStarSearch.prototype.runSearchAStar = function (start, goal) {
            var startNode = this.graphs.getVertex(start);
            this.openList.setValue(start, startNode);
            this.priQueue.add(startNode);
            var goalNode = null;
            while (this.openList.size() > 0) {
                var currentNode = this.priQueue.dequeue();
                this.openList.remove(currentNode.getVertexId());
                if (currentNode.getVertexId() == goal) {
                    goalNode = currentNode;
                    console.log("found goal : " + goalNode.getVertexId());
                    break;
                }
                else {
                    console.log("searching for node : " + currentNode.getVertexId());
                    this.closeList.setValue(currentNode.getVertexId(), currentNode);
                    var adjacents = this.graphs.getAdjacent(currentNode.getVertexId()).toArray();
                    for (var i = 0; i < adjacents.length; i++) {
                        var neighbor = adjacents[i];
                        var isVisited = this.closeList.containsKey(neighbor.getVertexId());
                        console.log("expanding node : " + neighbor.getVertexId());
                        if (!isVisited) {
                            var g = currentNode.getG() + this.graphs.getCostG(currentNode.getVertexId(), neighbor.getVertexId());
                            var n = this.openList.getValue(neighbor.getVertexId());
                            if (n == null) {
                                if (this.graphs.getEnabledGrid()) {
                                    var h = this.calMD(neighbor.getVertexId(), goal);
                                    // n = new Graph.Vertex(neighbor,g,h);
                                    n = this.graphs.getVertex(neighbor.getVertexId());
                                    n.setG(g);
                                    n.setH(h);
                                }
                                else {
                                    // n = new AStarVertex(neighbor,g,neighbor.getH());
                                    n = this.graphs.getVertex(neighbor.getVertexId());
                                    n.setG(g);
                                }
                                n.setParent(currentNode);
                                this.openList.setValue(neighbor.getVertexId(), n);
                                this.priQueue.add(n);
                            }
                            else if (g < n.getG()) {
                                n.setParent(currentNode);
                                n.setG(g);
                                if (this.graphs.getEnabledGrid()) {
                                    var h = this.calMD(neighbor.getVertexId(), goal);
                                    n.setH(h);
                                }
                                else {
                                    n.setH(neighbor.getH());
                                }
                            }
                        }
                    }
                }
            }
            if (goalNode != null) {
                var stack = new collections.Stack();
                var list = new collections.LinkedList();
                stack.push(goalNode);
                var parent = goalNode.getParent();
                while (parent != null) {
                    stack.push(parent);
                    parent = parent.getParent();
                }
                while (stack.size() > 0) {
                    list.add(stack.pop().getVertexId());
                }
                return list.toArray();
            }
            return ["error goal not found"];
        };
        return AStarSearch;
    })();
    AStar.AStarSearch = AStarSearch;
})(AStar || (AStar = {}));
