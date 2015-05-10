///<reference path="collections.ts"/>
///<reference path="MyNode.ts"/>

/*
Equality between states: prob on update of currWorld when drop or pick
Define equality with the goal



*/

module SearchAlgo{
    export function aStar(start: MyNode, goal: Interpreter.Literal[][]): string[]{
        var closedset: collections.Dictionary<string, MyNode> = new collections.Dictionary<string, MyNode>();
        var openset: collections.Dictionary<string, MyNode> = new collections.Dictionary<string, MyNode>();
        var lastAction: string;
        
        openset.setValue(start.hash ,start);
        
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
            };
        }
        return [];
    }    
    
    function heuristic(start: MyNode, goal: Interpreter.Literal[][]): number{
        return 0;
    }
    
    function reconstructPath(goal: MyNode): string[]{
        var path: string[] = [];
        var current: MyNode = goal;
        while(!current.lastAction == null){
            path.push(current.lastAction);
            current = current.parent;
        }

        return path;
    }
    
    function minFcost(openset: collections.Dictionary<string, MyNode>): MyNode {
        var tmp: MyNode;
        
        openset.forEach((k, v) => {
            if(tmp == null || v.fcost < tmp.fcost){
                tmp = v;
            }
        });
        
        return tmp;
    }
    
    function reachGoal(w: WorldState, goal: Interpreter.Literal[][]): boolean{
        var found, innerFound: boolean = false;
        var o1, o2, rel: string;
        
        for(var x = 0; found || x < goal.length; x++){
            for(var y = 0, innerFound = true; y < goal[x].length; y++){
                innerFound = innerFound && existsRelation(w, goal[x][y]);                
            }    
            found = innerFound;
        }
        return found;
    }
    
    function existsRelation(w: WorldState, g: Interpreter.Literal): boolean{
        var found: boolean = false;
        var rel: string = g.rel;
        var c1 = Helper.findCoord(g.args[0], w);
        var c2 = Helper.findCoord(g.args[1], w);
            
        
        if(rel == "ontop" || "inside"){
            found = (c1.x == c2.x && c1.y == c2.y+1);
        }else if(rel == "leftof"){
            found = (c1.x < c2.x);
        }else if(rel == "rightof"){
            found = (c1.x > c2.x);
        }else if(rel == "beside"){
            found = (c1.x == c2.x+1 || c1.x == c2.x-1);
        }else if(rel == "under"){
            found = (c1.x == c2.x && c1.y < c2.y);
        }
        
        return found;
    }

}