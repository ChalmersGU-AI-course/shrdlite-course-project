/// <reference path="lib/collections.ts" />

module Searcher {

    export interface searchInterface {
        getMneumonicFromCurrentState(): number;
        setCurrentStateFromMneumonic(mne:number);

        getHeuristicCostOfCurrentState(): number;
        isGoalCurrentState(): Boolean;

        nextChildAndMakeCurrent(): Boolean;
        nextSiblingAndMakeCurrent(): Boolean;

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
        frontier.pushFrontierElement(1,
                                     space.getHeuristicCostOfCurrentState(),
                                     lastMne = space.getMneumonicFromCurrentState());
        do {
            var mi = frontier.getSmallestCost();
            space.setCurrentStateFromMneumonic(mi.mneumonic);
            if(space.isGoalCurrentState())
                return true;
            var currentCost = mi.initialCost;
            if(space.nextChildAndMakeCurrent()) {
                ++currentCost;
                currentMne = space.getMneumonicFromCurrentState();
                if(currentMne > lastMne) {
                    frontier.pushFrontierElement(currentCost,
                                                 space.getHeuristicCostOfCurrentState(),
                                                 currentMne);
                    lastMne = currentMne;
                }
                while(space.nextSiblingAndMakeCurrent()) {
                    currentMne = space.getMneumonicFromCurrentState();
                    if(currentMne > lastMne) {
                        frontier.pushFrontierElement(currentCost,
                                                     space.getHeuristicCostOfCurrentState(),
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
