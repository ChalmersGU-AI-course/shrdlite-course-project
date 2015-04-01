/// <reference path="vendor\collections.ts" />
module Astar {      
    //n.state:,
    //n.parent:,
    //n.action:,
 export class Node{
    fscore: number;
    gscore: number;  // PATH-COST:
    children: [Node]
    constructor(g:number,nodes:[Node]){
      this.children = nodes
    }
  }
  interface Functions{
    heuristic_approx(n1:Node, n2:Node) : number
    dist_between(n1:Node, n2:Node) : number
  }
/*
Implementation: Strongly inspired by the wikipedia pseduocode
TODO: config priority que to sort by f(x) 

AStar :: Graph -> Path
*/
 export function Astar(start: Node, goal:Node, functions : Functions): Node[]{
    //Node comparion function
    function comp(a:Node,b:Node){
      if (a.fscore < b.fscore)
        return -1;
      else if (a.fscore > b.fscore)
        return 1;
      else{
        return 0;
      }
    }
    // Initilization Vendor Types 
    var closedset = new collections.Set<Node>(); // nodes already evaluated.
    var openset = new collections.Set<Node>(); // nodes to be evaluated.
    var queue =  new collections.PriorityQueue<Node>(comp); // works in parallel with openset
    var came_from = new collections.Dictionary<Node, Node>();
    // Initial calculations 
    start.gscore = 0; // the inital distace 
    start.fscore = start.gscore + functions.heuristic_approx(start,goal);
    openset.add(start);
    queue.add(start); 
    // Variable initiations moved outside reduce redundancy 
    var current : Node
    var neighbors :[Node]
    var g_score : number 
    /*
    g_score - is compared with the gscore - where gscore is the traveled distance - 
    of the node to check gscore can be reduced.
    for example, if there are two ways of reaching node x, then after it has been explored, 
    then the other path might provided a lower value.  
    */
    while (!openset.isEmpty){
        /*
        Necessary check! Without it the program will not terminate.
        It checks if the current node is the goal node,
        if it is then finds and returns the path.
        */
        current = queue.dequeue(); 
        if(current === goal){
          var path = new collections.LinkedList<Node>();
            path.add(current)
              while(came_from.getValue(current)){
                current = came_from.getValue(current)
                path.add(current);
              }
              path.reverse
              return path.toArray()
        }
        /*
        All modifying actions performed on the set will also have to be performed
        on the queue.
        TODO : make the queue sort its element by f(x).   
        */
        openset.remove(current)
        queue.dequeue() 
        closedset.add(current)
        neighbors = current.children // expand the node that is first in the queue.
         /*
        All the neigbors are checked, in several ways    
        */ 
        for(var neighbor in neighbors){
            if (!closedset.contains(neighbor)){
                g_score = current.gscore + functions.dist_between(current,neighbor) 
            }else{ // else if - is to prefer. 
            if (!openset.contains(neighbor) || neighbor.gscore < g_score){ // checks if the new path is better 
              came_from.setValue(neighbor,current)
              neighbor.gscore = g_score
              neighbor.fscore = neighbor.gscore + functions.heuristic_approx(start,goal);
                if (!openset.contains(neighbor)){
                  // The neighbor has passed all checks and the node is added, before the next node is considered.  
                  openset.add(neighbor)
                  queue.add(neighbor); 
                }
            }
          }
      }
  }
   //     if we end up here then there is no path between start and goal  
  throw new Error("no path!");
 }
};
