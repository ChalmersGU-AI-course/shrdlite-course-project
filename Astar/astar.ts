///<reference path="collections.ts"/>
///<reference path="graph.ts"/>

module AStar {
	

//helper function for priority queue to keep it sorted from lowest F to highest
function compareCost(first : Graph.Vertex, second : Graph.Vertex) : number {
    if(first.getF() < second.getF()){
        return 1;
    }else if(first.getF() > second.getF()){
        return -1;
    }
    return 0;
        
}

export class AStarSearch {

    private openList  : collections.Dictionary<string,Graph.Vertex>;
    private closeList : collections.Dictionary<string,Graph.Vertex>;
    private priQueue  : collections.PriorityQueue<Graph.Vertex>;
    private graphs    : Graph.Graph;

    constructor(g : Graph.Graph){
        this.openList  = new collections.Dictionary<string,Graph.Vertex>();
        this.closeList = new collections.Dictionary<string,Graph.Vertex>();
        this.priQueue  = new collections.PriorityQueue<Graph.Vertex>(compareCost);
        this.graphs    = g;
    }

    //calculate manhattan's distance from 2 position
    calMD(from : string, to : string) : number{
        var fromVtx = this.graphs.getVertex(from).getCoor();
        var toVtx = this.graphs.getVertex(to).getCoor();

        return Math.abs(fromVtx.posX - toVtx.posX) + Math.abs(fromVtx.posY - toVtx.posY);

    }

    //convert result from runSearchAstar to string that easier to read on HTML
    printPath(as : Array<string>) : string{
        var temp = "";

        for (var i = 0; i < as.length; i++) {
            if(i == 0){
                temp += "Start : " + as[i] + "</br>";
            }
            else if(i==as.length -1){
                temp += "Goal : " + as[i] + "</br>";
            }
            else{
                temp += "Goto : " + as[i] + "</br>";
            }
        }
        return temp;
    }


    //search a star 
    runSearchAStar(start : string, goal : string) : Array<string> {

        var startNode = this.graphs.getVertex(start);
        this.openList.setValue(start,startNode);
        this.priQueue.add(startNode);

        var goalNode : Graph.Vertex = null;

        while(this.openList.size() > 0){
            var currentNode = this.priQueue.dequeue();
            this.openList.remove(currentNode.getVertexId());

            if(currentNode.getVertexId() == goal){
                goalNode = currentNode;
                console.log("found goal : " + goalNode.getVertexId());
                break;
            }
            else{

                console.log("searching for node : " + currentNode.getVertexId());

                this.closeList.setValue(currentNode.getVertexId(),currentNode);
                var adjacents = this.graphs.getAdjacent(currentNode.getVertexId()).toArray();

                for (var i = 0; i < adjacents.length; i++) {

                    var neighbor : Graph.Vertex = adjacents[i];
                    var isVisited = this.closeList.containsKey(neighbor.getVertexId());
                    console.log("expanding node : " + neighbor.getVertexId());

                    if(!isVisited){
                        var g = currentNode.getG() + this.graphs.getCostG(currentNode.getVertexId(),neighbor.getVertexId());
                        var n = this.openList.getValue(neighbor.getVertexId());
                        
                        if(n == null){
                            if(this.graphs.getEnabledGrid()){
                               var h = this.calMD(neighbor.getVertexId(),goal);
                               // n = new Graph.Vertex(neighbor,g,h);
                               n = this.graphs.getVertex(neighbor.getVertexId());
                               n.setG(g);
                               n.setH(h);
                            }
                            else{
                               // n = new AStarVertex(neighbor,g,neighbor.getH());
                               n = this.graphs.getVertex(neighbor.getVertexId());
                               n.setG(g);
                            }
                            n.setParent(currentNode);
                            this.openList.setValue(neighbor.getVertexId(),n);
                            this.priQueue.add(n);


                        }else if(g < n.getG()){
                            n.setParent(currentNode);
                            n.setG(g);
                            if(this.graphs.getEnabledGrid()){
                                var h = this.calMD(neighbor.getVertexId(),goal);
                                n.setH(h);
                            }
                            else{
                                n.setH(neighbor.getH());
                            }

                        }
                    }
                }
            }
        }

        if(goalNode != null){
            var stack = new collections.Stack<Graph.Vertex>();
            var list = new collections.LinkedList<string>();
            stack.push(goalNode);
            var parent = goalNode.getParent();
            while(parent!= null){
                stack.push(parent);
                parent = parent.getParent();
            }

            while(stack.size() > 0){
                list.add(stack.pop().getVertexId());
            }
            return list.toArray();

        }

        return ["error goal not found"];

    }


}

}