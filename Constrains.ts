/// <reference path="lib/collections.ts" />

module Constrains {
    export interface ConstrainNode<T> {type : string;
                                       stringParameter : string;
                                       variables : collections.LinkedList<DomainNode<T>>;}
    export interface DomainNode<T> {domain : collections.Set<T>;
                                    constrains : collections.LinkedList<ConstrainNode<T>>;}
    export interface ArcNode<T> {variable : DomainNode<T>;
                                 constrain : ConstrainNode<T>;
                                 reverseArc? : boolean;}

    export interface constrainInterface {
        printDebugInfo(info : string) : void;
    }

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function constrain<T>(fullDomain : collections.Set<T>,
                                 head : Parser.Entity,
                                 space : constrainInterface,
                                 state : WorldState) : Boolean {
        space.printDebugInfo('start');
        if((head == null) || (head.obj == null))
            return false;
        var arcs : collections.LinkedList<ArcNode<T>> = new collections.LinkedList<ArcNode<T>>();
        var mainVariables : DomainNode<T> = constructGraph<T>(fullDomain, head, space, arcs);
        space.printDebugInfo('arcs '+ arcs.size());
        arcs.forEach((arc) => {
            if(!arc.reverseArc) {
                if(reduceDomain<T>(arc.variable, arc.constrain, space, state))
                    arcs.remove(arc);
            }
            return true;
        });
        printGraph<T>(mainVariables, space);

        space.printDebugInfo('end (arcs)' + arcs.size());
        return false;
    }

    export class Error implements Error {
        public name = "Constrainer.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    function printGraph<T>(node : DomainNode<T>, space : constrainInterface) : void {
        space.printDebugInfo('DomainNode, with ' + node.constrains.size() + ' Constrains');
        node.domain.forEach((ele) => {
            space.printDebugInfo('element ' + ele.toString());
            return true;
        });
        node.constrains.forEach((obj) => {
            printConstrain<T>(obj, space);
            return true;
        });
    }
    function printConstrain<T>(node : ConstrainNode<T>, space : constrainInterface) : void {
        space.printDebugInfo('ConstrainNode,' + node.type + ' str ' + node.stringParameter + ' with ' + node.variables.size() + ' Variables');
        node.variables.forEach((obj) => {
            printGraph<T>(obj, space);
            return true;
        });
    }

    //////////////////////////////////////////////////////////////////////
    // private functions and classes

    function constructGraph<T>(fullDomain : collections.Set<T>,
                               node : Parser.Entity,
                               space : constrainInterface,
                               arcs : collections.LinkedList<ArcNode<T>>) : DomainNode<T> {
        if((node == null) || (node.obj == null))
            return null;
        var variable : DomainNode<T> = {domain: copyDomain(fullDomain),
                                        constrains: new collections.LinkedList<ConstrainNode<T>>()};
        if(node.obj.loc == null)
            isAConstrains<T>(variable, node.obj, variable.constrains, arcs);
        else {
            isAConstrains<T>(variable, node.obj.obj, variable.constrains, arcs);
            var constrain : ConstrainNode<T> = constructRelation(fullDomain, node.obj.loc, space, arcs);
            variable.constrains.add(constrain);
            arcs.add({variable, constrain});
        }
        return variable;
    }

    function constructRelation<T>(fullDomain : collections.Set<T>,
                                  node : Parser.Location,
                                  space : constrainInterface,
                                  arcs : collections.LinkedList<ArcNode<T>>) : ConstrainNode<T> {
        var constrain : ConstrainNode<T> = {type: node.rel,
                                            stringParameter: null,
                                            variables: new collections.LinkedList<DomainNode<T>>()};
        constrain.variables.add(constructGraph<T>(fullDomain, node.ent, space, arcs));
        constrain.variables.forEach((obj) => {
            arcs.add({variable : obj, constrain : constrain, reverseArc : true});
            return true;
        });
        return constrain;
    }

    function isAConstrains<T>(variable : DomainNode<T>,
                              obj : Parser.Object,
                              intoCollection : collections.LinkedList<ConstrainNode<T>>,
                              arcs : collections.LinkedList<ArcNode<T>>) : void {
        if(obj.size)
            addArcAndConstrain<T>(variable,
                                  {type:"hasSize", stringParameter:obj.size, variables:new collections.LinkedList<DomainNode<T>>()},
                                  intoCollection,
                                  arcs);
        if(obj.color)
            addArcAndConstrain<T>(variable,
                                  {type:"hasColor", stringParameter:obj.color, variables:new collections.LinkedList<DomainNode<T>>()},
                                  intoCollection,
                                  arcs);
        if(obj.form)
            addArcAndConstrain<T>(variable,
                                  {type:"isA", stringParameter:obj.form, variables:new collections.LinkedList<DomainNode<T>>()},
                                  intoCollection,
                                  arcs);
    }

    function addArcAndConstrain<T>(variable : DomainNode<T>,
                                   constrain : ConstrainNode<T>,
                                   intoCollection : collections.LinkedList<ConstrainNode<T>>,
                                   arcs : collections.LinkedList<ArcNode<T>>) : void {
        intoCollection.add(constrain);
        arcs.add({variable : variable, constrain : constrain});
    }

    function reduceDomain<T>(variable : DomainNode<T>,
                             constrain : ConstrainNode<T>,
                             space : constrainInterface,
                             state : WorldState) {
        var a=getActiveVoiceAction<T>(constrain.type);
        if(a == null)
            return false;
        variable.domain.forEach((ele) => {
            if(a(state.objects[ele.toString()], constrain.stringParameter, constrain.variables, state) == false)
                variable.domain.remove(ele);
            return true;
        });
        return true;
    }

    //////////////////////////////////////////////////////////////////////
    // Constrains
    function getActiveVoiceAction<T>(act : string) {
        var actions = {hasSize:hasSize, hasColor:hasColor, isA:isA, inside:isInside};
        return actions[act.trim()];
    }
    function getPasiveVoiceAction<T>(act : string) {
        var actions = {inside:hasInside};
        return actions[act.trim()];
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

    function inside(objPos : whereInTheWorld,
                    ele : string,
                    state : WorldState) : boolean {
        var eleDefinition : ObjectDefinition = state.objects[ele];
        if(eleDefinition.form == 'box') {
            var containerPos : whereInTheWorld = findInWorld(eleDefinition, state);
            if((containerPos.stack == objPos.stack) &&
               (containerPos.row < objPos.stack))
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

    function hasInside<T>(obj:ObjectDefinition,
                 stringParameter:string,
                 variables:collections.LinkedList<DomainNode<T>>,
                 state : WorldState) {
        if(obj==null)
            return false; //the floor cant have anything inside
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
