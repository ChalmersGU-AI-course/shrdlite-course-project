///<reference path="Rules.ts"/>
///<reference path="Helper.ts"/>

class MyNode {
    world: WorldState;
    gcost : number = Number.MAX_VALUE; //Init for the algo
    fcost : number;
    lastAction: string;
    hash: string;
    parent: MyNode ; // Previous MyNode in the graph when using the algorithm
    neighbors: collections.Dictionary<MyNode, number> = new collections.Dictionary<MyNode, number>();
    
    
    constructor(s: WorldState, lastAction: string){
        this.world = s;
        this.lastAction = lastAction;   
    }
    
    getNeighbors(): MyNode[]{
        var nodes: MyNode[] = [];
        var actions: string[] = ["l", "r", "d", "p"]; 
        for(var i = 0; i < 4; i++){
            if(actions[i] != this.lastAction){
                var node = this.genNode(actions[i]);
                if(node != null){
                    node.hash = genHash(node.world.stacks, node.world.arm);
                    nodes.push(node);
                }
            }
        }
        return nodes;
    }
    
    genNode(action: string): MyNode{
        var node: MyNode;
        var world: WorldState = this.world;
        var newWState: WorldState;
        
        if(action == "l" && this.lastAction != "r" && 
           world.arm < world.stacks.length){
            newWState = {stacks: world.stacks, holding: world.holding, arm: world.arm-1, objects: world.objects};
            node = new MyNode(newWState, action);
        }else if(action == "r" && this.lastAction != "l" && 
                 world.arm > 0){
            newWState = {stacks: world.stacks, holding: world.holding, arm: world.arm+1, objects: world.objects};
            node = new MyNode(newWState, action);
        }else if(action == "p" && this.lastAction != "d" && 
                 world.holding == null && 
                 world.stacks[world.arm].length != 0){
            var hold: string = world.stacks[world.arm][world.stacks[world.arm].length-1];
            newWState = {stacks: newStacks(world.stacks, world.arm), holding: hold, arm: world.arm, objects: world.objects};
            node = new MyNode(newWState, action);
        }else if(action == "d" && this.lastAction != "p" &&
                 !Rules.breakRules(world.objects[world.holding], Helper.getObjAtCoord({x: world.arm, y: world.stacks[world.arm].length-1}, world), "ontop")){
            newWState = {stacks: newStacks(world.stacks, world.arm, world.holding), holding: null, arm: world.arm, objects: world.objects};
            node = new MyNode(newWState, action);
        }
        
        if(node != null){
            this.addNeighbor(node, 1);    
        }
        
        return node;
    }
    
    addNeighbor(neighbour: MyNode, distances: number) {
        this.neighbors.setValue(neighbour, distances);
    }
    
    distanceToMyNode(n: MyNode): number{
        return this.neighbors.getValue(n);
    }         
}

function newStacks(stacks: string[][], arm: number, holding?: string): string[][]{
    var newStacks: string[][];
    
    for(var x = 0; x < stacks.length; x++){
        for(var y = 0; y < stacks[x].length; y++){
            newStacks[x][y] = stacks[x][y];
        }    
    }
    if(holding == null){
        newStacks[arm].splice(newStacks[arm].length-1, 1);
    }else{
        newStacks[arm][newStacks[arm].length] = holding;    
    }
    
    return newStacks;
}

function genHash(s: string[][], arm: number): string{
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
    
    return tmp;
}