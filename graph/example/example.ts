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

    computePath(startPos: string, endPos: string) {
        return astar.compute(this.graph, startPos, endPos);
    }

    useStraightLineHeuristics() {
        this.graph.setHeuristicsFun((node: graphmodule.GraphNode<Tuple>) => {
                this.graph.nodes.forEach(
                    function forEachNodeAgain(node2: graphmodule.GraphNode<Tuple>) {

                        var x1 = node.data.first;
                        var y1 = node.data.second;

                        var x2 = node.data.first;
                        var y2 = node.data.second;

                        var distance = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));

                        node.heuristics.setValue(node2, distance);
                        return true;
                    }
                    );

                return true;
            }
            );
    }

    useManhattanHeuristics() {
        this.graph.setHeuristicsFun((node: graphmodule.GraphNode<Tuple>) => {
                this.graph.nodes.forEach(
                    function forEachNodeAgain(node2: graphmodule.GraphNode<Tuple>) {

                        var x1 = node.data.first;
                        var y1 = node.data.second;

                        var x2 = node2.data.first;
                        var y2 = node2.data.second;

                        var distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);

                        node.heuristics.setValue(node2, distance * 40);
                        return true;
                    }
                    );

                return true;
            }
            );
    }

}

function runExample(element: HTMLElement) {
    var gridGraph = new GridGraph();
    
    element.innerHTML += "StraigtLine Best Path from (1,1) to (9,7):";
    element.innerHTML += "<br>";
    gridGraph.useStraightLineHeuristics();
    element.innerHTML += gridGraph.computePath("1,1", "9,7");
    element.innerHTML += "<br>";
    element.innerHTML += "<br>";

    element.innerHTML += "Manhattan Best Path from (1,1) to (9,7):";
    element.innerHTML += "<br>";
    gridGraph.useManhattanHeuristics();
    element.innerHTML += gridGraph.computePath("1,1", "9,7");
    element.innerHTML += "<br>";
}

window.onload = () => {
    var el = document.getElementById('content');
    runExample(el);
};
