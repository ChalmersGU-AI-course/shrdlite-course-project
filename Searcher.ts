/// <reference path="lib/collections.ts" />

//////////////////////////////////////
// This implements the A*
//  algorithm found in the text book
//


module Searcher {

    export interface searchInterface {
        getMneumonicFromCurrentState(): number;
        setCurrentStateFromMneumonic(mne:number);

        getHeuristicGoalDistanceFromCurrentState(): number;
        getCostOfCurrentState(): number;
        isGoalCurrentState(): Boolean;

        nextChildAndMakeCurrent(): Boolean;
        nextSiblingAndMakeCurrent(): Boolean;

        nextInterprtationAndMakeCurrent(n : number): Boolean;

        printDebugInfo(info : string) : void;
    }

    export interface FrontierEntry {initialCost:number; cost:number; mneumonic:number;}

    export interface frontierInterface {
        getSmallestCost(): FrontierEntry;
        pushFrontierElement(initialCost:number, cost:number, mne:number): void;

        frontierSize(): number;
    }

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function search(space : searchInterface) : Boolean {
        var frontier : frontierInterface = new frontierQueue();
        var lastMne : number = -1;
        var currentMne : number = -1;
        var intNumber : number = 0;
        do {
            frontier.pushFrontierElement(1,
                                         space.getHeuristicGoalDistanceFromCurrentState(),
                                         lastMne = space.getMneumonicFromCurrentState());

            currentMne = space.getMneumonicFromCurrentState();
            frontier.pushFrontierElement(space.getCostOfCurrentState(),
                                             space.getHeuristicGoalDistanceFromCurrentState(),
                                             currentMne);
            lastMne = currentMne;

            space.setCurrentStateFromMneumonic(0);
        } while(space.nextInterprtationAndMakeCurrent(++intNumber));
        do {
            var mi : FrontierEntry = frontier.getSmallestCost();
            space.setCurrentStateFromMneumonic(currentMne = mi.mneumonic);
            if(space.isGoalCurrentState()) {
                frontier.pushFrontierElement(space.getCostOfCurrentState(),
                                             0,
                                             currentMne);
                if(mi.mneumonic == frontier.getSmallestCost().mneumonic)
                    return true;
            }
            if(space.nextChildAndMakeCurrent()) {
                currentMne = space.getMneumonicFromCurrentState();
                if(currentMne > lastMne) {
                    frontier.pushFrontierElement(space.getCostOfCurrentState(),
                                                 space.getHeuristicGoalDistanceFromCurrentState(),
                                                 currentMne);
                    lastMne = currentMne;
                }
                while(space.nextSiblingAndMakeCurrent()) {
                    currentMne = space.getMneumonicFromCurrentState();
                    if(currentMne > lastMne) {
                        frontier.pushFrontierElement(space.getCostOfCurrentState(),
                                                     space.getHeuristicGoalDistanceFromCurrentState(),
                                                     currentMne);
                        lastMne = currentMne;
                    }
                }
            } else
                space.printDebugInfo('no children');
        } while(frontier.frontierSize() > 0);
        if(space.isGoalCurrentState())
           return true;
        space.printDebugInfo('No more frontier to traverse');
        return false;
    }

    export class Error implements Error {
        public name = "Searcher.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions and classes

    function compare(a, b) {
        return -(a.cost + a.initialCost - b.cost - b.initialCost); // its minimization
    }

    class frontierQueue implements Searcher.frontierInterface {
        constructor() {}

        private frontier : collections.PriorityQueue<FrontierEntry>
                    = new collections.PriorityQueue<FrontierEntry>(compare);

        getSmallestCost(): FrontierEntry {
            return this.frontier.dequeue();
        }

        pushFrontierElement(initialCost:number, cost:number, mne:number): void {
            this.frontier.add({initialCost:initialCost, cost:cost, mneumonic:mne});
        }

        frontierSize(): number                  {return this.frontier.size();}
    }

}
