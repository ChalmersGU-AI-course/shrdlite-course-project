/// <reference path="lib/collections.ts" />

module Constrains {
    export interface ConstrainNode<T> {type : string;
                                       sringParameter : string;
                                       variables : collections.LinkedList<DomainNode<T>>;}
    export interface DomainNode<T> {domain : collections.Set<T>;
                                    constrains : collections.LinkedList<ConstrainNode<T>>;}


    export interface constrainInterface {
        printDebugInfo(info : string) : void;
    }

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function constrain<T>(fullDomain : collections.Set<T>, head : Parser.Entity, space : constrainInterface) : Boolean {
        space.printDebugInfo('start');
        if((head == null) || (head.obj == null))
            return false;
        var mainVariables : DomainNode<T> = constructGraph<T>(fullDomain, head, space);

        printGraph<T>(mainVariables, space);

        space.printDebugInfo('end');
        return false;
    }

    export class Error implements Error {
        public name = "Constrainer.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    function printGraph<T>(node : DomainNode<T>, space : constrainInterface) : void {
        space.printDebugInfo('DomainNode, with ' + node.constrains.size() + ' Constrains');
        node.constrains.forEach((obj) => {
            printConstrain<T>(obj, space);
            return true;
        });
    }
    function printConstrain<T>(node : ConstrainNode<T>, space : constrainInterface) : void {
        space.printDebugInfo('ConstrainNode,' + node.type + ' str ' + node.sringParameter + ' with ' + node.variables.size() + ' Variables');
        node.variables.forEach((obj) => {
            printGraph<T>(obj, space);
            return true;
        });
    }

    //////////////////////////////////////////////////////////////////////
    // private functions and classes
    function isAConstrains<T>(obj:Parser.Object, intoCollection:collections.LinkedList<ConstrainNode<T>>) : void {
        if(obj.size)
            intoCollection.add({type:"hasSize", sringParameter:obj.size, variables:new collections.LinkedList<DomainNode<T>>()});
        if(obj.color)
            intoCollection.add({type:"hasColor", sringParameter:obj.color, variables:new collections.LinkedList<DomainNode<T>>()});
        if(obj.form)
            intoCollection.add({type:"isA", sringParameter:obj.form, variables:new collections.LinkedList<DomainNode<T>>()});
    }

    function constructGraph<T>(fullDomain : collections.Set<T>, node : Parser.Entity, space : constrainInterface) : DomainNode<T> {
        if((node == null) || (node.obj == null))
            return null;
        var mainVariables : DomainNode<T> = {domain: copyDomain(fullDomain),
                                             constrains: new collections.LinkedList<ConstrainNode<T>>()};
        if(node.obj.loc == null) {
            isAConstrains<T>(node.obj, mainVariables.constrains);
        } else {
            isAConstrains<T>(node.obj.obj, mainVariables.constrains);
            mainVariables.constrains.add(constructRelation(fullDomain, node.obj.loc, space));
        }
        return mainVariables;
    }

    function constructRelation<T>(fullDomain : collections.Set<T>, node : Parser.Location, space : constrainInterface) : ConstrainNode<T> {
        var constrain : ConstrainNode<T> = {type: node.rel,
                                            sringParameter: null,
                                            variables: new collections.LinkedList<DomainNode<T>>()};
        constrain.variables.add(constructGraph<T>(fullDomain, node.ent, space));
        return constrain;
    }

    //////////////////////////////////////////////////////////////////////
    // Constrains
    /*
    private getAction(act) {
        var actions = {p:this.pick, d:this.drop, l:this.left, r:this.right};
        return actions[act.toLowerCase()];
    }
    */

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
