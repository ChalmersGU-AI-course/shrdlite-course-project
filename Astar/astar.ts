///<reference path="collections.ts"/>
///<reference path="graph.ts"/>

module AStar {
	
class AStarVertex {

    private aStarNode : Graph.Vertex;
    private costFromStart : number;
    private costToGoal : number;
    private parent   : AStarVertex;

    constructor(v : Graph.Vertex, g : number, h : number){
        this.aStarNode = v;
        this.costFromStart = g;
        this.costToGoal = h;
    }

    //return F value (g + h)
    getF() : number {
        return this.costFromStart + this.costToGoal;
    }

    //return G value (costFromStart)
    getG() : number {
        return this.costFromStart;
    }

    //return H value (costToGoal)
    getH() : number {
        return this.costToGoal;
    }

    //set new G (costFromStart)
    setG( g : number) {
        this.costFromStart = g;
    }

    //set new H (costToGoal)
    setH( h : number) {
        this.costToGoal = h;
    }

    //return vertex id 
    getVertexId() : string {
        return this.aStarNode.getVertexId();
    }

    //set paraent of current node (to trace back the result after we found goal)
    setParent(p : AStarVertex){
        this.parent = p;
    }

    //return parent of node
    getParent() : AStarVertex {
        return this.parent;
    }

    //return actual node
    getNode() : Graph.Vertex {
        return this.aStarNode;
    }


}

//helper function for priority queue to keep it sorted from lowest F to highest
function compareCost(first : AStarVertex, second : AStarVertex) : number {
    if(first.getF() < second.getF()){
        return 1;
    }else if(first.getF() > second.getF()){
        return -1;
    }
    return 0;
        
}

export class AStarSearch {

    private openList  : collections.Dictionary<string,AStarVertex>;
    private closeList : collections.Dictionary<string,AStarVertex>;
    private priQueue  : collections.PriorityQueue<AStarVertex>;
    private graphs    : Graph.Graph;

    constructor(g : Graph.Graph){
        this.openList  = new collections.Dictionary<string,AStarVertex>();
        this.closeList = new collections.Dictionary<string,AStarVertex>();
        this.priQueue  = new collections.PriorityQueue<AStarVertex>(compareCost);
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

        var startNode = null;
        if(this.graphs.getEnabledGrid()){
            var h = this.calMD(start,goal);
            startNode = new AStarVertex(this.graphs.getVertex(start),0,h);
        }
        else{
            startNode = new AStarVertex(this.graphs.getVertex(start),0,this.graphs.getVertex(start).getH());
        }
        this.openList.setValue(this.graphs.getVertex(start).getVertexId(),startNode);
        this.priQueue.add(startNode);

        var goalNode : AStarVertex = null;

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
                               n = new AStarVertex(neighbor,g,h);
                            }
                            else{
                               n = new AStarVertex(neighbor,g,neighbor.getH());
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
            stack.push(goalNode.getNode());
            var parent = goalNode.getParent();
            while(parent!= null){
                stack.push(parent.getNode());
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