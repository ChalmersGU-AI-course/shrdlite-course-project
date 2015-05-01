/// <reference path="lib/collections.ts" />

module Constrains {
    export interface ConstrainNode<T> {type : string;
                                       stringParameter : string;
                                       futureTense : boolean;
                                       variables : collections.LinkedList<DomainNode<T>>;}
    export interface DomainNode<T> {domain : collections.Set<T>;
                                    constrains : collections.LinkedList<ConstrainNode<T>>;}
    export interface ArcNode<T> {variable : DomainNode<T>;
                                 constrain : ConstrainNode<T>;
                                 reverseArc : boolean;}

    export interface Result<T> {what : collections.Set<T>; whereTo : DomainNode<T>;}

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function constrain<T>(fullDomain : collections.Set<T>,
                                 head : Parser.Command,
                                 state : WorldState) : Result<T> {
        if((head == null) || (head.ent.obj == null) || (head.loc.ent.obj == null))
            return null;

        var arcs : collections.LinkedList<ArcNode<T>> = new collections.LinkedList<ArcNode<T>>();
        var whereTo : DomainNode<T> = constructGraph<T>(fullDomain, head.loc.ent, arcs, true);
        var what : DomainNode<T> = constructGraph<T>(fullDomain, head.ent, arcs, false);
        if(head.loc.rel == "inside") {
            var constrain : ConstrainNode<T> = {type: "CanBeInside",
                                                stringParameter: null,
                                                variables: new collections.LinkedList<DomainNode<T>>(),
                                                futureTense : true};
            constrain.variables.add(whereTo);
            what.constrains.add(constrain);
            arcs.add({variable : what, constrain : constrain, reverseArc : false});
            arcs.add({variable : what, constrain : constrain, reverseArc : true});
        }
        var notActiveArcs : collections.LinkedList<ArcNode<T>> = new collections.LinkedList<ArcNode<T>>();
        do {
            var arc : ArcNode<T> = arcs.first();
            arcs.remove(arc);
            notActiveArcs.add(arc);

            if((arc.reverseArc == null) || (arc.reverseArc == false)) {
                if(reduceActiveVoice<T>(arc.variable, arc.constrain, state))
                    reSheduleArcs<T>(arcs, arc.variable, notActiveArcs);
            } else {
                if(reducePasiveVoice<T>(arc.variable, arc.constrain, state))
                    reSheduleArcs<T>(arcs, arc.variable, notActiveArcs);
            }
        } while(arcs.size() > 0);
        return {what : what.domain, whereTo : whereTo};
    }

    export class Error implements Error {
        public name = "Constrainer.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    //////////////////////////////////////////////////////////////////////
    // private functions and classes

    function constructGraph<T>(fullDomain : collections.Set<T>,
                               node : Parser.Entity,
                               arcs : collections.LinkedList<ArcNode<T>>,
                               futureTense : boolean) : DomainNode<T> {
        if((node == null) || (node.obj == null))
            return null;
        var variable : DomainNode<T> = {domain: copyDomain(fullDomain),
                                        constrains: new collections.LinkedList<ConstrainNode<T>>()};
        if(node.obj.loc == null)
            isAConstrains<T>(variable, node.obj, variable.constrains, arcs, futureTense);
        else {
            isAConstrains<T>(variable, node.obj.obj, variable.constrains, arcs, futureTense);
            var constrain : ConstrainNode<T> = constructRelation(fullDomain, node.obj.loc, arcs, futureTense);
            variable.constrains.add(constrain);
            arcs.add({variable : variable, constrain : constrain, reverseArc : true});
            arcs.add({variable : variable, constrain : constrain, reverseArc : false});
        }
        return variable;
    }

    function constructRelation<T>(fullDomain : collections.Set<T>,
                                  node : Parser.Location,
                                  arcs : collections.LinkedList<ArcNode<T>>,
                                  futureTense : boolean) : ConstrainNode<T> {
        var constrain : ConstrainNode<T> = {type: node.rel,
                                            stringParameter: null,
                                            variables: new collections.LinkedList<DomainNode<T>>(),
                                            futureTense : futureTense};
        constrain.variables.add(constructGraph<T>(fullDomain, node.ent, arcs, futureTense));
        return constrain;
    }

    function isAConstrains<T>(variable : DomainNode<T>,
                              obj : Parser.Object,
                              intoCollection : collections.LinkedList<ConstrainNode<T>>,
                              arcs : collections.LinkedList<ArcNode<T>>,
                              futureTense : boolean) : void {
        if(obj.size)
            addArcAndConstrain<T>(variable,
                                  {type:"hasSize", stringParameter:obj.size, variables:new collections.LinkedList<DomainNode<T>>(), futureTense : futureTense},
                                  intoCollection,
                                  arcs);
        if(obj.color)
            addArcAndConstrain<T>(variable,
                                  {type:"hasColor", stringParameter:obj.color, variables:new collections.LinkedList<DomainNode<T>>(), futureTense : futureTense},
                                  intoCollection,
                                  arcs);
        if(obj.form)
            addArcAndConstrain<T>(variable,
                                  {type:"isA", stringParameter:obj.form, variables:new collections.LinkedList<DomainNode<T>>(), futureTense : futureTense},
                                  intoCollection,
                                  arcs);
    }

    function addArcAndConstrain<T>(variable : DomainNode<T>,
                                   constrain : ConstrainNode<T>,
                                   intoCollection : collections.LinkedList<ConstrainNode<T>>,
                                   arcs : collections.LinkedList<ArcNode<T>>) : void {
        intoCollection.add(constrain);
        arcs.add({variable : variable, constrain : constrain, reverseArc : false});
    }

    function reduceActiveVoice<T>(variable : DomainNode<T>,
                                  constrain : ConstrainNode<T>,
                                  state : WorldState) {
        var a=getActiveVoiceAction<T>(constrain.type, constrain.futureTense);
        if(a == null)
            return false;
        var ret : boolean = false;
        var rep : boolean;
        do {
            rep = false;
            variable.domain.forEach((ele) => {
                if(a(state.objects[ele.toString()], constrain.stringParameter, constrain.variables, state) == false) {
                    variable.domain.remove(ele);
                    rep = true;
                    ret = true;
                }
                return true;
            });
        } while (rep);
        return ret;
    }

    function reducePasiveVoice<T>(source : DomainNode<T>,
                                  constrain : ConstrainNode<T>,
                                  state : WorldState) {
        var a=getPasiveVoiceAction<T>(constrain.type, constrain.futureTense);
        if(a == null)
            return false;
        var ret : boolean = false;
        var rep : boolean;
        do {
            rep = false;
            constrain.variables.forEach((variable) => {
                variable.domain.forEach((ele) => {
                    if(a(source, constrain.stringParameter, ele, state) == false) {
                        variable.domain.remove(ele);
                        rep = true;
                        ret = true;
                    }
                    return true;
                });
                return true;
            });
        } while (rep);
        return ret;
    }

    function reSheduleArcs<T>(arcs : collections.LinkedList<ArcNode<T>>, variable : DomainNode<T>, notActiveArcs : collections.LinkedList<ArcNode<T>>) {
        var rep : boolean;
        do {
            rep = false;
            notActiveArcs.forEach((arc) => {
                if(arc.variable == variable) {
                    notActiveArcs.remove(arc);
                    arcs.add(arc);
                    rep = true;
                }
                return true;
            });
        } while (rep);
    }


    //////////////////////////////////////////////////////////////////////
    // Constrains
    function getActiveVoiceAction<T>(act : string, futureTense : boolean) {
        var actions = {hasSize:hasSize, hasColor:hasColor, isA:isA, inside:isInside, ontop:isOntop,
                       under:isUnder, above:isAbove, beside:isBeside, leftof:isLeftof, rightof:isRightof,
                       CanBeInside:isCanBeInside
        };
        var facts = {hasSize:hasSize, hasColor:hasColor, isA:isA, CanBeInside:isCanBeInside};
        return !futureTense ? actions[act.trim()] : facts[act.trim()];
    }
    function getPasiveVoiceAction<T>(act : string, futureTense : boolean) {
        var actions = {inside:hasSomethingInside, ontop:hasSomethingOntop,
                       under:hasSomethingUnder, above:hasSomethingAbove, beside:hasSomethingBeside,
                       leftof:hasSomethingLeftof, rightof:hasSomethingRightof,
                       CanBeInside:hasCanBeInside};
        var facts = {CanBeInside:hasCanBeInside};
        return !futureTense ? actions[act.trim()] : facts[act.trim()];
    }

    function hasSize<T>(obj:ObjectDefinition,
                     stringParameter:string,
                     variables:collections.LinkedList<DomainNode<T>>,
                     state : WorldState) {
        if(obj==null)
            return true; //the floor has an unspecified size
        if(obj.size != stringParameter)
            return false;
        return true;
    }

    function hasColor<T>(obj:ObjectDefinition,
                      stringParameter:string,
                      variables:collections.LinkedList<DomainNode<T>>,
                      state : WorldState) {
        if(obj==null)
            return true; //the floor has an unspecified color
        if(obj.color != stringParameter)
            return false;
        return true;
    }

    function isA<T>(obj:ObjectDefinition,
                    stringParameter:string,
                    variables:collections.LinkedList<DomainNode<T>>,
                    state : WorldState) {
        if(obj==null)
            return stringParameter == 'floor'; //the floor is something in particular
        if(obj.form != stringParameter)
            return false;
        return true;
    }

    interface whereInTheWorld {stack:number; row:number; what:string}

    function findInWorld(obj:ObjectDefinition,
                         state : WorldState) : whereInTheWorld {
        for(var stack=0; stack < state.stacks.length; ++stack)
            for(var row=0; row < state.stacks[stack].length; ++row)
                if(state.objects[state.stacks[stack][row]] == obj)
                    return {stack:stack, row:row, what:state.stacks[stack][row]};
    }

    function CanBeInside(lhs : ObjectDefinition,
                         rhs : ObjectDefinition) : boolean {
        if((lhs == null) || (rhs == null))
            return false; // floor

        if(rhs.form == 'box') {
            if((lhs.form == 'box') && (lhs.size == rhs.size))
                return false; // cant put a same size box in a box
            if(lhs.size == rhs.size)
                return true; // a ball or a table can be but in a same size box
            if(rhs.size == 'large')
                return true; // large box can carry anything else
        }
        return false;
    }

    function isCanBeInside<T>(obj:ObjectDefinition,
                 stringParameter:string,
                 variables:collections.LinkedList<DomainNode<T>>,
                 state : WorldState) {
        var ret : boolean = false;
        variables.forEach((variable) => {
            variable.domain.forEach((ele) => {
                ret = CanBeInside(obj, state.objects[ele.toString()]);
                return !ret;
            });
            return !ret;
        });
        return ret;
    }

    function hasCanBeInside<T>(variable:DomainNode<T>,
                 stringParameter:string,
                 objEle:T,
                 state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            ret = CanBeInside(state.objects[ele.toString()], state.objects[objEle.toString()]);
            return !ret;
        });
        return ret;
    }

    function inside(lhs : whereInTheWorld,
                    ele : string,
                    state : WorldState) : boolean {
        var eleDefinition : ObjectDefinition = state.objects[ele];
        if(eleDefinition.form == 'box') {
            var rhs : whereInTheWorld = findInWorld(eleDefinition, state);
            if((rhs.stack == lhs.stack) &&
               (lhs.row > rhs.row))
                return true;
        }
        return false;
    }

    function isInside<T>(obj:ObjectDefinition,
                 stringParameter:string,
                 variables:collections.LinkedList<DomainNode<T>>,
                 state : WorldState) {
        if(obj==null)
            return false; //the floor cant be inside anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variables.forEach((variable) => {
            variable.domain.forEach((ele) => {
                ret = inside(objPos, ele.toString(), state);
                return !ret;
            });
            return !ret;
        });
        return ret;
    }

    function hasSomethingInside<T>(variable:DomainNode<T>,
                 stringParameter:string,
                 objEle:T,
                 state : WorldState) {
        if(state.objects[objEle.toString()] == null)
            return false; //the floor cant have anything inside
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = inside(objPos, objEle.toString(), state);
            return !ret;
        });
        return ret;
    }

    function ontop(lhs : whereInTheWorld,
                   eleDefinition : ObjectDefinition,
                   state : WorldState) : boolean {
        if(eleDefinition == null)
            return lhs.row == 0; //the floor
        var rhs : whereInTheWorld = findInWorld(eleDefinition, state);
        if((rhs.stack == lhs.stack) &&
           (lhs.row - 1 == rhs.row))
            return true;
        return false;
    }

    function isOntop<T>(obj:ObjectDefinition,
                        stringParameter:string,
                        variables:collections.LinkedList<DomainNode<T>>,
                        state : WorldState) {
        if(obj==null)
            return false; //the floor cant be on top of anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variables.forEach((variable) => {
            variable.domain.forEach((ele) => {
                ret = ontop(objPos, state.objects[ele.toString()], state);
                return !ret;
            });
            return !ret;
        });
        return ret;
    }

    function hasSomethingOntop<T>(variable:DomainNode<T>,
                         stringParameter:string,
                         objEle:T,
                         state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = ontop(objPos, state.objects[objEle.toString()], state);
            return !ret;
        });
        return ret;
    }

    function under(lhs : whereInTheWorld,
                   eleDefinition : ObjectDefinition,
                   state : WorldState) : boolean {
        if(eleDefinition == null)
            return false; //the floor
        var rhs : whereInTheWorld = findInWorld(eleDefinition, state);
        if((rhs.stack == lhs.stack) &&
           (lhs.row < rhs.row))
            return true;
        return false;
    }

    function isUnder<T>(obj:ObjectDefinition,
                        stringParameter:string,
                        variables:collections.LinkedList<DomainNode<T>>,
                        state : WorldState) {
        if(obj==null)
            return true; //the floor is under everything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variables.forEach((variable) => {
            variable.domain.forEach((ele) => {
                ret = under(objPos, state.objects[ele.toString()], state);
                return !ret;
            });
            return !ret;
        });
        return ret;
    }

    function hasSomethingUnder<T>(variable:DomainNode<T>,
                         stringParameter:string,
                         objEle:T,
                         state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = under(objPos, state.objects[objEle.toString()], state);
            return !ret;
        });
        return ret;
    }

    function above(lhs : whereInTheWorld,
                   eleDefinition : ObjectDefinition,
                   state : WorldState) : boolean {
        if(eleDefinition == null)
            return true; //the floor
        var rhs : whereInTheWorld = findInWorld(eleDefinition, state);
        if((lhs.stack == rhs.stack) &&
           (lhs.row > rhs.row))
            return true;
        return false;
    }

    function isAbove<T>(obj:ObjectDefinition,
                        stringParameter:string,
                        variables:collections.LinkedList<DomainNode<T>>,
                        state : WorldState) {
        if(obj==null)
            return false; //the floor cant be above of anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variables.forEach((variable) => {
            variable.domain.forEach((ele) => {
                ret = above(objPos, state.objects[ele.toString()], state);
                return !ret;
            });
            return !ret;
        });
        return ret;
    }

    function hasSomethingAbove<T>(variable:DomainNode<T>,
                         stringParameter:string,
                         objEle:T,
                         state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = above(objPos, state.objects[objEle.toString()], state);
            return !ret;
        });
        return ret;
    }

    function beside(lhs : whereInTheWorld,
                   eleDefinition : ObjectDefinition,
                   state : WorldState) : boolean {
        if(eleDefinition == null)
            return false; //the floor
        var rhs : whereInTheWorld = findInWorld(eleDefinition, state);
        if((rhs.stack-1 == lhs.stack) &&
           (rhs.stack+1 == lhs.stack))
            return true;
        return false;
    }

    function isBeside<T>(obj:ObjectDefinition,
                        stringParameter:string,
                        variables:collections.LinkedList<DomainNode<T>>,
                        state : WorldState) {
        if(obj==null)
            return false; //the floor cant be beside of anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variables.forEach((variable) => {
            variable.domain.forEach((ele) => {
                ret = beside(objPos, state.objects[ele.toString()], state);
                return !ret;
            });
            return !ret;
        });
        return ret;
    }

    function hasSomethingBeside<T>(variable:DomainNode<T>,
                         stringParameter:string,
                         objEle:T,
                         state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = beside(objPos, state.objects[objEle.toString()], state);
            return !ret;
        });
        return ret;
    }

    function leftof(lhs : whereInTheWorld,
                   eleDefinition : ObjectDefinition,
                   state : WorldState) : boolean {
        if(eleDefinition == null)
            return false; //the floor
        var rhs : whereInTheWorld = findInWorld(eleDefinition, state);
        if(lhs.stack < rhs.stack)
            return true;
        return false;
    }

    function isLeftof<T>(obj:ObjectDefinition,
                        stringParameter:string,
                        variables:collections.LinkedList<DomainNode<T>>,
                        state : WorldState) {
        if(obj==null)
            return false; //the floor cant be left of anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variables.forEach((variable) => {
            variable.domain.forEach((ele) => {
                ret = leftof(objPos, state.objects[ele.toString()], state);
                return !ret;
            });
            return !ret;
        });
        return ret;
    }

    function hasSomethingLeftof<T>(variable:DomainNode<T>,
                         stringParameter:string,
                         objEle:T,
                         state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = leftof(objPos, state.objects[objEle.toString()], state);
            return !ret;
        });
        return ret;
    }

    function rightof(lhs : whereInTheWorld,
                   eleDefinition : ObjectDefinition,
                   state : WorldState) : boolean {
        if(eleDefinition == null)
            return false; //the floor
        var rhs : whereInTheWorld = findInWorld(eleDefinition, state);
        if(lhs.stack > rhs.stack)
            return true;
        return false;
    }

    function isRightof<T>(obj:ObjectDefinition,
                        stringParameter:string,
                        variables:collections.LinkedList<DomainNode<T>>,
                        state : WorldState) {
        if(obj==null)
            return false; //the floor cant be right of anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variables.forEach((variable) => {
            variable.domain.forEach((ele) => {
                ret = rightof(objPos, state.objects[ele.toString()], state);
                return !ret;
            });
            return !ret;
        });
        return ret;
    }

    function hasSomethingRightof<T>(variable:DomainNode<T>,
                         stringParameter:string,
                         objEle:T,
                         state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = rightof(objPos, state.objects[objEle.toString()], state);
            return !ret;
        });
        return ret;
    }

    //////////////////////////////////////////////////////////////////////
    // Utilities
    function copyDomain<T>(fullDomain : collections.Set<T>) : collections.Set<T> {
        var domain : collections.Set<T> = new collections.Set<T>();
        fullDomain.forEach((obj) => {
            domain.add(obj);
            return true;
        });
        return domain;
    }
}
