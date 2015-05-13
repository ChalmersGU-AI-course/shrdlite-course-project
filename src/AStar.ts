/// <reference path="./MySet"/>
///<reference path="Interpreter.ts"/>
///<reference path="Planner.ts"/>

module AStar {

    type THeuristicF = (state: Planner.State, goalConditions: Interpreter.Literal[]) => number;

    /*
     * @returns Node[] or null
     */
    export function astar(start: Node, goalConditions: Interpreter.Literal[], heuristic: THeuristicF) : Planner.Move[] {
        var closedset = new MySet<string>(); // The set of nodes already evaluated. It contains the hash of the states.
        var openset = new Map<string, Node>(); // The set of tentative nodes to be evaluated, initially containing the start node. It maps hash of states to the best corresponding Node.

        start.setScores(0,heuristic(start.content,goalConditions));
        openset.set(start.content.hash, start);
        
        console.log("Début AStar !");
        console.dir(openset);
        while (openset.size > 0) { // openset is not empty
            var current: Node = lowestFScoreNode(openset);
            if (current.f_score==current.g_score) { // <=> heuristic(current.content, goalConditions)==0 : SUCCESS !!
                // In the case of holding objects.
                var hold: string = null;
                goalConditions.forEach((goal) => {
                    if(goal.rel=="holding") {hold=goal.args[0];}
                });
                if(hold) {
                    var m = new Planner.Move(Planner.getLocation(hold, current.content.stacks)[0], -1);
                    current.content.moves.push(m);
                }
                return current.content.moves;
            }
            openset.delete(current.content.hash); // remove current from openset
            closedset.add(current.content.hash); // add current to closedset
            current.computeNeighbors();
            current.neighbors.forEach((arc) => {
                var neighbor = arc.destination;
                var weight = arc.weight;
                if (closedset.has(neighbor.content.hash)) return; // continue
                if (!openset.has(neighbor.content.hash) || current.g_score+weight < openset.get(neighbor.content.hash).g_score) {
                    neighbor.setScores(current.g_score+weight, heuristic(neighbor.content, goalConditions));
                    openset.set(neighbor.content.hash, neighbor);
                }
            });
        }
        return null;
    }

    export class Arc {

      constructor(public destination: Node, public weight: number) {
      }

    }

    export class Node {

      public neighbors: Arc[] = [];
      public g_score: number; // Cost from start along best known path
      public f_score: number; // Estimated cost from start to goal g=f+heuristic

      constructor(public content: Planner.State) {
          this.g_score = -1;
          this.f_score = -1;
      }
      
      setScores(g: number, h: number) {
          this.g_score = g;
          this.f_score = g+h;
      }
      
      addNeighbor(node: Node, weight: number) : void {
        var arc = new Arc(node, weight);
        this.neighbors.push(arc);
      }
      
      computeNeighbors() {
          var moves = Planner.CheckPhysics.possibleMoves(this.content.stacks);
          moves.forEach((m) => {
              var stacks = this.content.stacks.map((stack)=>stack.slice(0)); // Copy the stacks
              var moves = this.content.moves.map((move)=>new Planner.Move(move.pick,move.drop)); // Copy the moves
              stacks[m.drop].push(stacks[m.pick].pop()); // Perform the move m
              moves.push(m); // Add the move to the list
              var s = new Planner.State(stacks,moves); // Creation of the new state
              this.addNeighbor(new Node(s), 1);
          });
      }
      
      neighborNodes(): Node[] {
        return this.neighbors.map((arc) => arc.destination);
      }
    }

    function lowestFScoreNode(set: Map<string, Node>) : Node {
        // the node in openset having the lowest f_score value
        var min_f = Number.POSITIVE_INFINITY;
        var min_node: Node = null;
        set.forEach((node) => {
            if(node.f_score<min_f) {
                min_f=node.f_score;
                min_node=node;
            }
        });
        return min_node;
    }
}
