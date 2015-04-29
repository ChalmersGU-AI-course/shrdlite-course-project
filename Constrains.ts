/// <reference path="lib/collections.ts" />

module Constrains {
    export interface ConstrainNode<T> {}
    export interface DomainNode<T> {domain : collections.Set<T>;
                                    objectConstrains : collections.Set<ObjConstrainNode<T>>;
                                    locationConstrains : collections.Set<LocationConstrainNode<T>>;}

    export interface ObjConstrainNode<T> extends ConstrainNode<T> {constrain:Parser.Object;}
    export interface LocationConstrainNode<T> extends ConstrainNode<T> {constrain:Parser.Location; variables:collections.Set<DomainNode<T>>;}

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
        public name = "Searcher.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    function printGraph<T>(node : DomainNode<T>, space : constrainInterface) : void {
        space.printDebugInfo('DomainNode, with ' + node.locationConstrains.size() + ' locationConstrains');
        node.objectConstrains.forEach((obj) => {
            printObjectConstrain<T>(obj, space);
            return true;
        });
        node.locationConstrains.forEach((obj) => {
            printLocationConstrain<T>(obj, space);
            return true;
        });
    }
    function printLocationConstrain<T>(node : LocationConstrainNode<T>, space : constrainInterface) : void {
        space.printDebugInfo('LocationConstrainNode,' + node.constrain.rel + ' with ' + node.variables.size() + ' Variables');
        node.variables.forEach((obj) => {
            printGraph<T>(obj, space);
            return true;
        });
    }
    function printObjectConstrain<T>(node : ObjConstrainNode<T>, space : constrainInterface) : void {
        space.printDebugInfo('ObjectConstrainNode');
    }

    //////////////////////////////////////////////////////////////////////
    // private functions and classes

    function constructGraph<T>(fullDomain : collections.Set<T>, head : Parser.Entity, space : constrainInterface) : DomainNode<T> {
        if((head == null) || (head.obj == null))
            return null;
        var domain : collections.Set<T> = new collections.Set<T>();
        fullDomain.forEach((obj) => {
            domain.add(obj);
            return true;
        });
        var mainVariables : DomainNode<T> = {domain: domain,
                                             objectConstrains: new collections.Set<ObjConstrainNode<T>>(),
                                             locationConstrains: new collections.Set<LocationConstrainNode<T>>()};
        if(head.obj.loc == null) {
            mainVariables.objectConstrains.add({constrain:head.obj});
        } else {
            mainVariables.objectConstrains.add({constrain:head.obj.obj});
            mainVariables.locationConstrains.add(constructRelation<T>(fullDomain, head.obj.loc, space));
        }
        return mainVariables;
    }

    function constructRelation<T>(fullDomain : collections.Set<T>, head : Parser.Location, space : constrainInterface) : LocationConstrainNode<T> {
        var constrain : LocationConstrainNode<T> = {constrain: head,
                                                    variables: new collections.Set<DomainNode<T>>()};
        constrain.variables.add(constructGraph<T>(fullDomain, head.ent, space));
        return constrain;
    }

    //////////////////////////////////////////////////////////////////////
    // Utilities

}
