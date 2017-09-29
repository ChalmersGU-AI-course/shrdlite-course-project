/// <reference path="lib/collections.ts" />

//////////////////////////////////////
// This implements the A*
//  algorithm found in the text book
//
//  It is a little bit tainted As I added all the interpretations
//  in the frontier. That makes the program work as a general optimizer
//  for all the plans,
//
//  kind of worked exept I have seen it prefer a worst plan. Maybe its the hieuristic or maybe the bug is here
//  it was the hiuristic

module Searcher {

    export interface searchInterface { // Inteface... This is a general solver exept for the interpretations
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

    export interface frontierInterface { // Prio Queue
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
        } while(space.nextInterprtationAndMakeCurrent(++intNumber)); // ALL THE INTERPRETATIONS ARE ADDED IN THE FRONTIER

        do {
            var mi : FrontierEntry = frontier.getSmallestCost();
            space.setCurrentStateFromMneumonic(currentMne = mi.mneumonic);

            // RECHECKING IF SOME OTHER STATE HAS STILL A SHOT AT BEATING THIS SOLUTION
            if(space.isGoalCurrentState()) {
                frontier.pushFrontierElement(space.getCostOfCurrentState(),
                                             0,
                                             currentMne);
                if(mi.mneumonic == frontier.getSmallestCost().mneumonic)
                    return true;
            }

            // CHILDREN AND ONE LEVEL OF SIBLINGS
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
            }
        } while(frontier.frontierSize() > 0);

        // PRETTY MUCH GAME OVER
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


module.exports.Searcher = Searcher;

