///<reference path="Rules.ts"/>
///<reference path="Helper.ts"/>

/**
 * Representation of a node in the search tree of the search algorithm
 */
class MyNode {
    world: WorldState;
    gcost : number = Number.MAX_VALUE; //Init for the algo
    fcost : number;
    lastAction: string; 
    hash: string; //Hash of the node (use to check if two nodes are the same)
    parent: MyNode ; // Previous MyNode in the graph when using the algorithm
    neighbors: collections.Set<MyNode> = new collections.Set<MyNode>(); //Map
    
    
    constructor(s: WorldState, lastAction: string){
        this.world = s;
        this.lastAction = lastAction;   
    }
    
    /**
     * Generates the neighbors of this node (avoids to go back to the previous state)
     */
    getNeighbors(): MyNode[]{
        var nodes: MyNode[] = [];
        var actions: string[] = ["l", "r", "d", "p"]; 
        for(var i = 0; i < 4; i++){
            if(!(actions[i] == "l" && this.lastAction == "r" ||
                actions[i] == "r" && this.lastAction == "l" ||
                actions[i] == "p" && this.lastAction == "d" ||
                actions[i] == "d" && this.lastAction == "p")){
                var node = this.genNode(actions[i]);
                if(node != null){
                    node.genHash();
                    nodes.push(node);
                }
            }
        }
        return nodes;
    }
    
    /**
     * Generates the hash of the node: arm position + stacks as a string
     * 
     */
    genHash(){
        var s = this.world.stacks;
        var arm = this.world.arm;
        
        var tmp: string = arm.toString();
        var l: number;
        
        for(var i = 0; i < s.length; i++){
            l = s[i].length;
            if(l == 0){
                tmp += "_";    
            }else{
                tmp += l.toString();
                for(var j = 0; j < s[i].length; j++){
                    tmp += s[i][j];    
                }    
            }
        }
        this.hash = tmp;
    }
    
    /**
     * Generate the neighbor node after the specified action
     */
    genNode(action: string): MyNode{
        var node: MyNode;
        var world: WorldState = this.world;
        var newWState: WorldState;
        
        if(action == "l" && world.arm > 0){
            newWState = {stacks: world.stacks, holding: world.holding, arm: world.arm-1, objects: world.objects};
            node = new MyNode(newWState, action);
        }else if(action == "r" && world.arm < world.stacks.length - 1){
            newWState = {stacks: world.stacks, holding: world.holding, arm: world.arm+1, objects: world.objects};
            node = new MyNode(newWState, action);
        }else if(action == "p" && world.holding == null && world.stacks[world.arm].length != 0){
            var hold: string = world.stacks[world.arm][world.stacks[world.arm].length-1];
            newWState = {stacks: newStacks(world.stacks, world.arm), holding: hold, arm: world.arm, objects: world.objects};
            node = new MyNode(newWState, action);
        }else if(action == "d" && world.holding != null){
            var relObj = Helper.getObjAtCoord({x: world.arm, y: world.stacks[world.arm].length - 1}, world);
            var rel = relObj.form == "box" ? "inside" : "ontop";
            if(!Rules.breakRules(world.objects[world.holding], relObj, rel)){
                newWState = {stacks: newStacks(world.stacks, world.arm, world.holding), holding: null, arm: world.arm, objects: world.objects};
                node = new MyNode(newWState, action);
            }
        }
        
        if(node != null){
            this.neighbors.add(node);
        }
        
        return node;
    }
    
    /**
     * At the moment each node are at distance of one form each other
     */
    distanceToMyNode(n: MyNode): number{
        return 1;
    }         
}

/**
 * Generates the new stacks after a pick or a drop 
 */
function newStacks(stacks: string[][], arm: number, holding?: string): string[][]{
    var newS: string[][] = [];
    
    for(var x = 0; x < stacks.length; x++){
        newS[x] = new Array();
        for(var y = 0; y < stacks[x].length; y++){
            newS[x][y] = stacks[x][y];
        }    
    }
    
    //pick
    if(holding == null){
        newS[arm].splice(newS[arm].length-1, 1);
    //drop
    }else{
        newS[arm][newS[arm].length] = holding;    
    }
    
    return newS;
}
