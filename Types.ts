
/********************************************************************************
** Types

This module contains type and class declarations for parse results 
and interpretations.

You don't have to edit this file (unless you add things to the grammar).
********************************************************************************/


export class ShrdliteResult {
    constructor(
        public input : string,
        public parse : Command,
        public interpretation? : DNFFormula,
        public plan? : string[],
    ) {}
}


//////////////////////////////////////////////////////////////////////
// Parse results

export type Command = TakeCommand | DropCommand | MoveCommand | WhereisCommand;

export class TakeCommand {
    constructor(public entity : Entity) {}
    toString() : string {return `TakeCommand(${this.entity.toString()})`};
    clone() : TakeCommand {return new TakeCommand(this.entity.clone())};
}

export class DropCommand {
    constructor(public location:Location) {}
    toString() : string {return `DropCommand(${this.location.toString()})`};
    clone() : DropCommand {return new DropCommand(this.location.clone())};
}

export class MoveCommand {
    constructor(public entity:Entity,
                public location:Location) {}
    toString() : string {return `MoveCommand(${this.entity.toString()}, ${this.location.toString()})`};
    clone() : MoveCommand {return new MoveCommand(this.entity.clone(), this.location.clone())};
}

export class WhereisCommand {
    constructor(public entity : Entity) {}
    toString() : string {return `WhereisCommand(${this.entity.toString()})`};
    clone() : WhereisCommand {return new WhereisCommand(this.entity.clone())};
}


export class Location {
    constructor(public relation:string,
                public entity:Entity) {}
    toString() : string {return `Location(${this.relation}, ${this.entity.toString()})`}
    clone() : Location {return new Location(this.relation, this.entity.clone())};
}


export class Entity {
    constructor(public quantifier:string,
                public object:Object) {}
    toString() : string {return `Entity(${this.quantifier}, ${this.object.toString()})`};
    clone() : Entity {return new Entity(this.quantifier, this.object.clone())};
}


export type Object = RelativeObject | SimpleObject;

export class RelativeObject {
    constructor(public object:Object,
                public location:Location) {}
    toString() : string {return `RelativeObject(${this.object.toString()}, ${this.location.toString()})`};
    clone() : RelativeObject {return new RelativeObject(this.object.clone(), this.location.clone())};
}

export class SimpleObject {
    constructor(public size:Size,
                public color:Color,
                public form:Form) {}
    toString() : string {return `SimpleObject(${this.size}, ${this.color}, ${this.form})`};
    clone() : SimpleObject {return new SimpleObject(this.size, this.color, this.form)};
}

type Size = "small" | "large";
type Color = "red" | "black" | "blue" | "green" | "yellow" | "white";
type Form = "anyform" | "brick" | "plank" | "ball" | "pyramid" | "box" | "table";


//////////////////////////////////////////////////////////////////////
// Interpretations

export class DNFFormula {
    constructor(public conjuncts : Conjunction[] = []) {}
    toString() : string {return this.conjuncts.map((conj) => conj.toString()).join(" | ")};
}

export class Conjunction {
    constructor(public literals : Literal[] = []) {}
    toString() : string {return this.literals.map((lit) => lit.toString()).join(" & ")};
}

// A Literal represents a relation that is intended to hold among some objects.
export class Literal {
    constructor(
        public relation : string,         // The name of the relation in question
        public args : string[],           // The arguments to the relation
        public polarity : boolean = true, // Whether the literal is positive (true) or negative (false)
    ) {}
    toString() : string {return (this.polarity ? "" : "-") + this.relation + "(" + this.args.join(",") + ")"};
}
