/// <reference path="../../lib/typescript-collections/collections.ts" />
/// <reference path="../graph.ts" />
/// <reference path="../astar.ts" />

//Tuple holding two numbers (used as position)
class Tuple {
    constructor(public first: number, public second: number) { }
}

/** A graph which has a tuple as data for the nodes, making them have position.
    The map is a grid which contains 1 or 0 if the node is an actual node or a wall */
class GridGraph{
    public graph: graphmodule.Graph<Tuple>;

    /**Create a grid world. 1 is a node, 0 is a wall */
    public map: number[][] = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1]
    ];

    constructor() {
        this.graph = new graphmodule.Graph<Tuple>();


        //Create node for each 1 in the map
        for (var i = 0; i < this.map.length; i++) {
            for (var j = 0; j < this.map.length; j++) {
                if (this.map[i][j] === 1) {
                    this.graph.addNode(new graphmodule.GraphNode(i + "," + j, new Tuple(i, j)));
                }

            }
        }

        //Create an edge between each nodes which is adjacent and not a wall
        for (var i = 0; i < this.map.length; i++) {
            for (var j = 0; j < this.map.length; j++) {
                var js = j + 1 < this.map.length;
                var is = i + 1 < this.map.length;
                var is2 = i - 1 > 0;

                if (js) {
                    if (this.map[i][j + 1] === 1) {
                        this.graph.addEdge(i + "," + j, i + "," + (j + 1), 1, true);
                    }
                }

                if (is) {
                    if (this.map[i + 1][j] === 1) {
                        this.graph.addEdge(i + "," + j,(i + 1) + "," + j, 1, true);
                    }
                }

                if (js && is) {
                    if (this.map[i + 1][j + 1] === 1) {
                        this.graph.addEdge(i + "," + j,(i + 1) + "," + (j + 1), 1.41, true);
                    }
                }

                if (js && is2) {
                    if (this.map[i - 1][j + 1] === 1) {
                        this.graph.addEdge(i + "," + j,(i - 1) + "," + (j + 1), 1.41, true);
                    }
                }

            }
        }

    }

    computePath(startPos: string, endPos: string, hFun: graphmodule.HeuristicFunction<Tuple>) {
        return astar.compute(this.graph, startPos, endPos, hFun);
    }

    euclidianDistance(startNode: Tuple, goalNode: Tuple){
        var x1 = startNode.first;
        var y1 = startNode.second;

        var x2 = goalNode.first;
        var y2 = goalNode.second;

        var distance = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));

        return distance;
    }

    manhattanDistance(startNode: Tuple, goalNode: Tuple){
        var x1 = startNode.first;
        var y1 = startNode.second;

        var x2 = goalNode.first;
        var y2 = goalNode.second;

        var distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
        
        return distance*40;
    }

}

        
function runExample(element: HTMLElement) {
    var gridGraph = new GridGraph();
    
    element.innerHTML += "Graph used (gridGraph):";
    element.innerHTML += "<br><br>";
    
    element.innerHTML += "&#9633; &#9633; &#9633; &#9633; &#9633; &#9633; &#9633; &#9633; &#9633; &#9633<br>";
    element.innerHTML += "&#9633; ";
    element.innerHTML += "<text style='color:blue'>&#9633;</>";
    element.innerHTML += " &#9633; &#9633; &#9633; &#9633; &#9633; &#9633; &#9633; &#9633<br>";
    element.innerHTML += "&#9633; &#9633; &#9633; &#9633; &#9632; &#9633; &#9633; &#9633; &#9633; &#9633<br>";
    element.innerHTML += "&#9633; &#9633; &#9633; &#9633; &#9632; &#9633; &#9633; &#9633; &#9633; &#9633<br>";
    element.innerHTML += "&#9633; &#9633; &#9633; &#9633; &#9632; &#9632; &#9632; &#9633; &#9633; &#9633<br>";
    element.innerHTML += "&#9633; &#9633; &#9633; &#9633; &#9632; &#9633; &#9633; &#9633; &#9633; &#9633<br>";
    element.innerHTML += "&#9633; &#9633; &#9633; &#9633; &#9632; &#9633; &#9632; &#9633; &#9633; &#9633<br>";
    element.innerHTML += "&#9633; &#9633; &#9633; &#9633; &#9632; &#9633; &#9632; &#9633; &#9633; &#9633<br>";
    element.innerHTML += "&#9633; &#9633; &#9633; &#9633; &#9632; &#9633; &#9632; &#9633; &#9633; &#9633<br>";
    element.innerHTML += "&#9633; &#9633; &#9633; &#9633; &#9633; &#9633; &#9632; ";
    element.innerHTML += "<text style='color:red'>&#9633;</>";
    element.innerHTML +=" &#9633; &#9633<br><br>";
    
    element.innerHTML += "Euclidian distance Best Path from (1,1) to (9,7):";
    element.innerHTML += "<br>";
    
    //Set and use the euclidianDistance
    element.innerHTML += gridGraph.computePath("1,1", "9,7", gridGraph.euclidianDistance);
    element.innerHTML += "<br><br>";

    element.innerHTML += "Manhattan Best Path from (1,1) to (9,7):";
    element.innerHTML += "<br>";
    
    //Set and use manhattanDistance
    element.innerHTML += gridGraph.computePath("1,1", "9,7", gridGraph.manhattanDistance);
    element.innerHTML += "<br>";
}

window.onload = () => {
    var el = document.getElementById('content');
    runExample(el);
};
