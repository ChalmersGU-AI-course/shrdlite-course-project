/// <reference path="lib/collections.ts" />

//////////////////////////////////////////////////////////////////////
// This handles constrins
// Basically we have a list of arcs which are re/evaluated until
// no further elements from the variables domains can be taken out
//
// This is not general, it is tied to the block world from
//  function reduceVoice under.
//
// Could be Abstracted : TODO
//

module Constrains {
    export interface ConstrainNode<T> {type : string;
                                       stringParameter : string;
                                       futureTense : boolean;}
    export interface VariableNode<T> {domain : collections.Set<T>;
                                      name : string;}
    export interface ArcNode<T> {variable1 : VariableNode<T>;
                                 variable2 : VariableNode<T>;
                                 constrain : ConstrainNode<T>;}

    export interface Result<T> {what : collections.Set<T>; whereTo : collections.LinkedList<ArcNode<T>>;}

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function constrain<T>(fullDomain : collections.Set<T>,
                                 head : Parser.Command,
                                 state : WorldState) : Result<T> {
        if((head == null) || (head.ent.obj == null))
            return null;
        var arcs : collections.LinkedList<ArcNode<T>> = new collections.LinkedList<ArcNode<T>>();
        var what : VariableNode<T> = constructGraph<T>(fullDomain, head.ent, arcs, false, 'what');

        if((head.loc == null) || (head.loc.ent.obj == null)) {
            arcReduction<T>(arcs, state);
            return {what : what.domain, whereTo : null};
        }

        var whereTo : VariableNode<T> = constructGraph<T>(fullDomain, head.loc.ent, arcs, true, 'whereTo');
        var actions = {inside:'CanBeInside',
                       under :'CanBeUnder'
        };
        var verb = actions[head.loc.rel];
        if(verb != null) {
            var constrain : ConstrainNode<T> = {type: verb,
                                                stringParameter: null,
                                                futureTense : true};
            arcs.add({variable1 : what,
                      constrain : {type: verb,
                                   stringParameter: null,
                                   futureTense : true},
                      variable2 : whereTo});
            arcs.add({variable1 : whereTo,
                      constrain : {type: "Reverse_" + verb,
                                   stringParameter: null,
                                   futureTense : true},
                      variable2 : what});
        }
        var notActiveArcs : collections.LinkedList<ArcNode<T>> = arcReduction<T>(arcs, state);
        return {what : what.domain, whereTo : relatedArcs<T>(whereTo, notActiveArcs, true)};
    }

    function arcReduction<T>(arcs : collections.LinkedList<ArcNode<T>>,
                             state : WorldState):collections.LinkedList<ArcNode<T>> {
        var notActiveArcs : collections.LinkedList<ArcNode<T>> = new collections.LinkedList<ArcNode<T>>();
        do {
            var arc : ArcNode<T> = arcs.first();
            arcs.remove(arc);
            notActiveArcs.add(arc);
            if(reduceVoice<T>(arc, state))
               reSheduleArcs<T>(arcs, arc, notActiveArcs);
        } while(arcs.size() > 0);
        return notActiveArcs;
    }

    export class Error implements Error {
        public name = "Constrainer.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    function printArcs<T>(str: string, arcs : collections.LinkedList<ArcNode<T>>) {
        arcs.forEach((obj) => {
            var s : string = '<null>';
            if(obj.variable2 != null)
                s = obj.variable2.name;
            console.log(str +  ' constrain type ' + obj.constrain.type + ', parameter ' + obj.constrain.stringParameter + ', tense ' + obj.constrain.futureTense
                + ', variable1 ' + obj.variable1.name  + ', variable2 ' + s
            );
            return true;
        })
    }

    //////////////////////////////////////////////////////////////////////
    // private functions and classes
    function relatedArcs<T>(variable : VariableNode<T>,
                            arcs : collections.LinkedList<ArcNode<T>>,
                            withFixProperties : boolean) : collections.LinkedList<ArcNode<T>> {
        var res : collections.LinkedList<ArcNode<T>> = new collections.LinkedList<ArcNode<T>>();
        var facts = {hasSize:false, hasColor:false, isA:false, CanBeInside:false,
                     Reverse_hasSize:false, Reverse_hasColor:false, Reverse_isA:false, Reverse_CanBeInside:false};
        arcs.forEach((obj) => {
            if(obj.variable1 == variable) {
                if(!withFixProperties) {
                  var a = facts[obj.constrain.type.trim()];
                  if((a == null) || (a))
                    res.add(obj);
                } else
                    res.add(obj);
            }
            return true;
        })
        return res;
    }

    function constructGraph<T>(fullDomain : collections.Set<T>,
                               node : Parser.Entity,
                               arcs : collections.LinkedList<ArcNode<T>>,
                               futureTense : boolean,
                               namePrefix : string) : VariableNode<T> {
        if((node == null) || (node.obj == null))
            return null;
        var variable : VariableNode<T> = {domain: copyDomain(fullDomain), name : namePrefix};
        if(node.obj.loc == null)
            isAConstrains<T>(variable, node.obj, arcs, futureTense);
        else {
            isAConstrains<T>(variable, node.obj.obj, arcs, futureTense);
            var arc : ArcNode<T> = constructRelation(fullDomain, variable, node.obj.loc, arcs, futureTense, namePrefix);
            arcs.add(arc);
            arcs.add({variable1 : arc.variable2,
                      constrain : {type: "Reverse_" + arc.constrain.type,
                                   stringParameter: arc.constrain.stringParameter,
                                   futureTense : arc.constrain.futureTense},
                      variable2 : arc.variable1});
        }
        return variable;
    }

    function constructRelation<T>(fullDomain : collections.Set<T>,
                                  variable : VariableNode<T>,
                                  node : Parser.Location,
                                  arcs : collections.LinkedList<ArcNode<T>>,
                                  futureTense : boolean,
                                  namePrefix : string) : ArcNode<T> {
        var constrain : ConstrainNode<T> = {type: node.rel,
                                            stringParameter: null,
                                            futureTense : futureTense};
        return {variable1 : variable,
                variable2 : constructGraph<T>(fullDomain, node.ent, arcs, futureTense, namePrefix + '.' + node.rel),
                constrain : constrain};
    }

    function isAConstrains<T>(variable : VariableNode<T>,
                              obj : Parser.Object,
                              arcs : collections.LinkedList<ArcNode<T>>,
                              futureTense : boolean) : void {
        if(obj.size)
            addArcAndConstrain<T>(variable,
                                  null,
                                  {type:"hasSize", stringParameter:obj.size, futureTense : futureTense},
                                  arcs);
        if(obj.color)
            addArcAndConstrain<T>(variable,
                                  null,
                                  {type:"hasColor", stringParameter:obj.color, futureTense : futureTense},
                                  arcs);
        if(obj.form)
            addArcAndConstrain<T>(variable,
                                  null,
                                  {type:"isA", stringParameter:obj.form, futureTense : futureTense},
                                  arcs);
    }

    function addArcAndConstrain<T>(variable1 : VariableNode<T>,
                                   variable2 : VariableNode<T>,
                                   constrain : ConstrainNode<T>,
                                   arcs : collections.LinkedList<ArcNode<T>>) : void {
        arcs.add({variable1 : variable1, constrain : constrain, variable2 : variable2});
    }

    function reduceVoice<T>(arc : ArcNode<T>,
                            state : WorldState) {
        var a = getVoiceAction<T>(arc.constrain.type, arc.constrain.futureTense);
        if(a == null) {
            console.log(' DEBUG / no support for ' + arc.constrain.type+ ' future '+arc.constrain.futureTense);
            return false;
        }
        var ret : boolean = false;
        var rep : boolean;
        do {
            rep = false;
            arc.variable1.domain.forEach((ele) => {
                if(a(state.objects[ele.toString()], arc.constrain.stringParameter, arc.variable2, state) == false) {
                    arc.variable1.domain.remove(ele);
                    rep = true;
                    ret = true;
                }
                return true;
            });
        } while (rep);
        return ret;
    }

    function reSheduleArcs<T>(arcs : collections.LinkedList<ArcNode<T>>, variable : ArcNode<T>, notActiveArcs : collections.LinkedList<ArcNode<T>>) {
        var rep : boolean;
        do {
            rep = false;
            notActiveArcs.forEach((arc) => {
                if(arc.variable2 == variable.variable1) {
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
    function getVoiceAction<T>(act : string, futureTense : boolean) {
        var actions = {hasSize:hasSize, hasColor:hasColor, isA:isA, inside:isInside, ontop:isOntop,
                       under:isUnder, above:isAbove, beside:isBeside, leftof:isLeftof, rightof:isRightof,
                       CanBeInside:isCanBeInside,

                       Reverse_inside:hasSomethingInside, Reverse_ontop:hasSomethingOntop,
                       Reverse_under:hasSomethingUnder, Reverse_above:hasSomethingAbove, Reverse_beside:hasSomethingBeside,
                       Reverse_leftof:hasSomethingLeftof, Reverse_rightof:hasSomethingRightof,
                       Reverse_CanBeInside:hasCanBeInside
        };
        var facts = {hasSize:hasSize, hasColor:hasColor, isA:isA,
                     ontop:CanBeMoved,  Reverse_ontop:Reverse_CanBeMoved,
                     inside:CanBeMoved, Reverse_inside:Reverse_CanBeMoved,
                     under:CanBeMoved, Reverse_under:Reverse_CanBeMoved,
                     beside:CanBeMoved, Reverse_beside:Reverse_CanBeMoved,

                     leftof:CanBeLeftof, Reverse_leftof:Reverse_CanBeLeftof,
                     rightof:CanBeRightof, Reverse_rightof:Reverse_CanBeRightof,

                     CanBeInside:isCanBeInside,          CanBeUnder:hasCanBeInside,
                     Reverse_CanBeInside:hasCanBeInside, Reverse_CanBeUnder:isCanBeInside,
        };
        return !futureTense ? actions[act.trim()] : facts[act.trim()];
    }

    function hasSize<T>(obj : ObjectDefinition,
                        stringParameter : string,
                        variable : VariableNode<T>,
                        state : WorldState) {
        if(obj==null)
            return true; //the floor has an unspecified size
        if(obj.size != stringParameter)
            return false;
        return true;
    }

    function hasColor<T>(obj : ObjectDefinition,
                         stringParameter : string,
                         variable : VariableNode<T>,
                         state : WorldState) {
        if(obj==null)
            return true; //the floor has an unspecified color
        if(obj.color != stringParameter)
            return false;
        return true;
    }

    function isA<T>(obj : ObjectDefinition,
                    stringParameter : string,
                    variable : VariableNode<T>,
                    state : WorldState) {
        if(obj==null)
            return stringParameter == 'floor'; //the floor is something in particular
        if(stringParameter == 'anyform')
            return true;
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

    function CanBeMoved<T>(obj : ObjectDefinition,
                        stringParameter : string,
                        variable : VariableNode<T>,
                        state : WorldState) {
        if(obj==null)
            return false; //the floor cant be on top of anything
        return true;
    }

    function Reverse_CanBeMoved<T>(obj : ObjectDefinition,
                        stringParameter : string,
                        variable : VariableNode<T>,
                        state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            ret = state.objects[ele.toString()] != null;
            return !ret;
        });
        return ret;
    }

    function CanBeLeftof<T>(obj : ObjectDefinition,
                        stringParameter : string,
                        variable : VariableNode<T>,
                        state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = objPos.row > 0;
            return !ret;
        });
        return ret;
    }

    function CanBeRightof<T>(obj : ObjectDefinition,
                        stringParameter : string,
                        variable : VariableNode<T>,
                        state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = objPos.row < state.stacks.length - 1;
            return !ret;
        });
        return ret;
    }

    function Reverse_CanBeLeftof<T>(obj : ObjectDefinition,
                        stringParameter : string,
                        variable : VariableNode<T>,
                        state : WorldState) {
        var objPos : whereInTheWorld = findInWorld(obj, state)
        return objPos.row < state.stacks.length - 1;
    }

    function Reverse_CanBeRightof<T>(obj : ObjectDefinition,
                        stringParameter : string,
                        variable : VariableNode<T>,
                        state : WorldState) {
        var objPos : whereInTheWorld = findInWorld(obj, state)
        return objPos.row > 0;
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
        if(rhs.form == 'ball')
            return false;
        return true;
    }

    function isCanBeInside<T>(obj : ObjectDefinition,
                              stringParameter : string,
                              variable : VariableNode<T>,
                              state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
                ret = CanBeInside(obj, state.objects[ele.toString()]);
                return !ret;
            });
        return ret;
    }

    function hasCanBeInside<T>(obj : ObjectDefinition,
                               stringParameter : string,
                               variable : VariableNode<T>,
                               state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            ret = CanBeInside(state.objects[ele.toString()], obj);
            return !ret;
        });
        return ret;
    }

    function inside(lhs : whereInTheWorld,
                    eleDefinition : ObjectDefinition,
                    state : WorldState) : boolean {
        if(eleDefinition.form == 'box') {
            var rhs : whereInTheWorld = findInWorld(eleDefinition, state);
            if((rhs.stack == lhs.stack) &&
               (lhs.row > rhs.row))
                return true;
        }
        return false;
    }

    function isInside<T>(obj : ObjectDefinition,
                         stringParameter : string,
                         variable : VariableNode<T>,
                         state : WorldState) {
        if(obj==null)
            return false; //the floor cant be inside anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
           ret = inside(objPos, state.objects[ele.toString()], state);
           return !ret;
        });
        return ret;
    }

    function hasSomethingInside<T>(obj : ObjectDefinition,
                                   stringParameter : string,
                                   variable : VariableNode<T>,
                                   state : WorldState) {
        if(obj == null)
            return false; //the floor cant have anything inside
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = inside(objPos, obj, state);
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

    function isOntop<T>(obj : ObjectDefinition,
                        stringParameter : string,
                        variable : VariableNode<T>,
                        state : WorldState) {
        if(obj==null)
            return false; //the floor cant be on top of anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
           ret = ontop(objPos, state.objects[ele.toString()], state);
           return !ret;
        });
        return ret;
    }

    function hasSomethingOntop<T>(obj : ObjectDefinition,
                                  stringParameter : string,
                                  variable : VariableNode<T>,
                                  state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = ontop(objPos, obj, state);
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

    function isUnder<T>(obj : ObjectDefinition,
                        stringParameter : string,
                        variable : VariableNode<T>,
                        state : WorldState) {
        if(obj==null)
            return true; //the floor is under everything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
           ret = under(objPos, state.objects[ele.toString()], state);
           return !ret;
        });
        return ret;
    }

    function hasSomethingUnder<T>(obj : ObjectDefinition,
                                  stringParameter : string,
                                  variable : VariableNode<T>,
                                  state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = under(objPos, obj, state);
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

    function isAbove<T>(obj : ObjectDefinition,
                        stringParameter : string,
                        variable : VariableNode<T>,
                        state : WorldState) {
        if(obj==null)
            return false; //the floor cant be above of anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
           ret = above(objPos, state.objects[ele.toString()], state);
           return !ret;
        });
        return ret;
    }

    function hasSomethingAbove<T>(obj : ObjectDefinition,
                                  stringParameter : string,
                                  variable : VariableNode<T>,
                                  state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = above(objPos, obj, state);
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

    function isBeside<T>(obj : ObjectDefinition,
                         stringParameter : string,
                         variable : VariableNode<T>,
                         state : WorldState) {
        if(obj==null)
            return false; //the floor cant be beside of anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
           ret = beside(objPos, state.objects[ele.toString()], state);
           return !ret;
        });
        return ret;
    }

    function hasSomethingBeside<T>(obj : ObjectDefinition,
                                   stringParameter : string,
                                   variable : VariableNode<T>,
                                   state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = beside(objPos, obj, state);
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

    function isLeftof<T>(obj : ObjectDefinition,
                         stringParameter : string,
                         variable : VariableNode<T>,
                         state : WorldState) {
        if(obj==null)
            return false; //the floor cant be left of anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
           ret = leftof(objPos, state.objects[ele.toString()], state);
           return !ret;
        });
        return ret;
    }

    function hasSomethingLeftof<T>(obj : ObjectDefinition,
                                   stringParameter : string,
                                   variable : VariableNode<T>,
                                   state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = leftof(objPos, obj, state);
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

    function isRightof<T>(obj : ObjectDefinition,
                          stringParameter : string,
                          variable : VariableNode<T>,
                          state : WorldState) {
        if(obj==null)
            return false; //the floor cant be right of anything
        var objPos : whereInTheWorld = findInWorld(obj, state);
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
           ret = rightof(objPos, state.objects[ele.toString()], state);
           return !ret;
        });
        return ret;
    }

    function hasSomethingRightof<T>(obj : ObjectDefinition,
                                    stringParameter : string,
                                    variable : VariableNode<T>,
                                    state : WorldState) {
        var ret : boolean = false;
        variable.domain.forEach((ele) => {
            var objPos : whereInTheWorld = findInWorld(state.objects[ele.toString()], state);
            ret = rightof(objPos, obj, state);
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
