///<reference path="collections.ts"/>
///<reference path="MyNode.ts"/>

module SearchAlgo{
    /**
     * A* algorithm
     */
    export function aStar(start: MyNode, goal: Interpreter.Literal[][]): string[]{
        //Dicitionaries are used because it provides efficient ways to add, delete and check if an element exists already in the data strucure
        var closedset: collections.Dictionary<string, MyNode> = new collections.Dictionary<string, MyNode>();
        var openset: collections.Dictionary<string, MyNode> = new collections.Dictionary<string, MyNode>();
       
        openset.setValue(start.hash, start);
        
        start.gcost = 0;
        start.fcost = start.gcost + heuristic(start, goal);
        
         while(!openset.isEmpty()){
            var current: MyNode = minFcost(openset);
            
            if(reachGoal(current.world, goal)){
                return reconstructPath(current);
            }
            
            openset.remove(current.hash);          
            closedset.setValue(current.hash, current);
            
            var neighbors: MyNode[] = current.getNeighbors();
            for(var i = 0; i < neighbors.length; i++){
                var n: MyNode = neighbors[i];
                if(closedset.containsKey(n.hash)){
                    continue;
                }
                
                var tmpGCost: number = current.gcost + current.distanceToMyNode(n);
                var opensetContains:boolean = openset.containsKey(n.hash);
                
                if(!opensetContains || tmpGCost < n.gcost){
                    n.parent = current;
                    n.gcost = tmpGCost;
                    n.fcost = n.gcost + heuristic(n, goal);
                    if(!opensetContains){
                        openset.setValue(n.hash, n);
                    }
                }
            }
        }
        return [];
    }    
    
    /**
     * Heuristic for the A* algorithm, works for my case where the inside arrays are actually in each just a lonely literal.
     * This heuristic is based on the distance between objects in the literal and the minimal number of pick and drop necessary
     * for reach the final goal.
     * After few trys I estimated that the number of steps needed to go through A-star were decreased by 25% to 40% 
     * (Compared to a heuristic that returns 0)     
     */
    function heuristic(node: MyNode, goal: Interpreter.Literal[][]): number{
        var fcosts: number[] = [];
        var l: Interpreter.Literal;
        var pos0: number;
        var pos1: number
        var state: WorldState = node.world;
        var toAdd: number; // increase if there is a need to drop and/or pick objects
        
        for(var i = 0; i < goal.length; i++){
            l = goal[i][0];
            
            //Case where the relation is "holding"
            if(l.rel == "holding"){
                if(node.world.holding == l.args[0]){
                    fcosts[i] = 0;
                }else{
                    toAdd = (node.world.holding == null) ? 1 : 2; //minimal pick and drop = 1 pick or (1 drop and 1 pick)
                    fcosts[i] = Math.abs(node.world.arm - Helper.findCoord(l.args[0], state).x) + toAdd;
                }
            //Case where the floor is the second argument
            }else if(l.args[1] == "floor"){
                var closestEmpty: number = Number.MAX_VALUE;
                var smallestSize: number = Number.MAX_VALUE;
                
                if(node.world.holding == l.args[0]){
                    toAdd = 1; //minimal pick and drop = 1 drop
                    pos0 = node.world.arm;
                }else{
                    toAdd = (node.world.holding == null) ? 2 : 3; //minimal pick and drop = (1 pick and 1 drop) or (1 drop and 1 pick and 1 drop)
                    pos0 = Helper.findCoord(l.args[0], state).x;
                }
                
                //find the closest empty stack to the object
                for(var j = 0; j < node.world.stacks.length; j++){
                    if(node.world.stacks[j].length == 0 && closestEmpty >  Math.abs(pos0 - j)){
                        closestEmpty = Math.abs(pos0 - j);
                    }
                }
                
                //if there are no empty stack return the min of drop and pick 
                if(closestEmpty == Number.MAX_VALUE){
                    fcosts[i] = toAdd+3;
                }else{
                    fcosts[i] = closestEmpty + toAdd;
                }
            //General case
            }else{
                if(node.world.holding == l.args[0] || node.world.holding == l.args[1]){
                    toAdd = 1; //minimal pick and drop = 1 drop
                    if(node.world.holding == l.args[0]){
                        pos0 = node.world.arm;
                        pos1 = Helper.findCoord(l.args[1], state).x;
                    }else{
                        pos0 = Helper.findCoord(l.args[0], state).x;
                        pos1 = node.world.arm;
                    }
                }else{
                    toAdd = node.world.holding == null ? 2 : 3; //minimal pick and drop = (1 pick and 1 drop) or (1 drop and 1 pick and 1 drop)
                    pos0 = Helper.findCoord(l.args[0], state).x;
                    pos1 = Helper.findCoord(l.args[1], state).x
                }
                    
                if(l.rel == "ontop" || l.rel == "above" || l.rel == "under" || l.rel == "inside"){ 
                    fcosts[i] = Math.abs(pos0 - pos1) + toAdd;
                }else if(l.rel == "beside"){
                    fcosts[i] = Math.min(Math.abs(pos0 - (pos1 + 1)), Math.abs(pos0 - (pos1 - 1))) + toAdd;
                }else if(l.rel == "leftof"){
                    fcosts[i] = pos0 < pos1 ? 0 : pos0 - (pos1 - 1) + toAdd;
                }else if(l.rel == "rightof"){
                    fcosts[i] = pos0 < pos1 ? 0 : pos0 - (pos1 + 1) + toAdd;
                }
            }
        }

        return min(fcosts);
    }
    
    /**
     * Reconstruct the path that has been taken to reach the specified node
     */
    function reconstructPath(goal: MyNode): string[]{
        var path: string[] = [];
        var current: MyNode = goal;
        while(current.parent != null){
            path.unshift(current.lastAction);
            current = current.parent;
        }
        
        if(path.length == 0){
            path.push("Already true");    
        }
        
        return path;
    }
    
    /**
     * Returns the node with the minimal fcost
     */
    function minFcost(openset: collections.Dictionary<string, MyNode>): MyNode {
        var tmp: MyNode;
        
        openset.forEach((k, v) => {
            if(tmp == null || v.fcost < tmp.fcost){
                tmp = v;
            }
        });
        
        return tmp;
    }
    
    /**
     * Checks if the goal has been reached 
     */
    function reachGoal(ws: WorldState, goal: Interpreter.Literal[][]): boolean{
        var found: boolean = false;
        var innerFound: boolean;
        var o1, o2, rel: string;
        
        for(var x = 0; !found && x < goal.length; x++){
            for(var y = 0; !innerFound && y < goal[x].length; y++){
                if(y == 0){
                    innerFound = true;    
                }
                innerFound = (innerFound && existsRelation(ws, goal[x][y]));                
            }    
            found = innerFound;
        }
        return found;
    }
    
    /**
     * Checks if the literal can be found in the world
     */
    function existsRelation(ws: WorldState, g: Interpreter.Literal): boolean{
        var found: boolean = false;
        var rel: string = g.rel;
            
        if(rel == "holding"){
            found = (ws.holding == g.args[0]);
        }else if(!(g.args[0] == ws.holding || g.args[1] == ws.holding)){
            var c1 = Helper.findCoord(g.args[0], ws);
            if(g.args[1] == "floor"){
                  found = (rel == "ontop" && c1.y == 0);      
            }else{    
                var c2 = Helper.findCoord(g.args[1], ws);
                
                if(rel == "ontop" || rel == "inside"){
                    found = (c1.x == c2.x && c1.y == c2.y+1);
                }else if(rel == "leftof"){
                    found = (c1.x < c2.x);
                }else if(rel == "rightof"){
                    found = (c1.x > c2.x);
                }else if(rel == "beside"){
                    found = (c1.x == c2.x+1 || c1.x == c2.x-1);
                }else if(rel == "under"){
                    found = (c1.x == c2.x && c1.y < c2.y);
                }else if(rel == "above"){
                    found = (c1.x == c2.x && c1.y > c2.y);
                }     
            }
            
        }
        
        return found;
    }
    
    /**
     * Returns the minimal element in this array
     */
    function min(array: number[]): number{
        var tmp: number = Number.MAX_VALUE;
        for(var i = 0; i < array.length; i++){
            tmp = Math.min(tmp, array[i]);    
        }
        return tmp;
    }
}