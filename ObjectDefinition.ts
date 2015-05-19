class ObjectDefinition {
    form: string;
    size: string;
    color: string;


    constructor(form:string, size:string, color:string) {
        this.form = form;
        this.size = size;
        this.color = color;
    }

    // The floor is not an object, so this function does not care about it.
    canBePutOn(otherObj : ObjectDefinition) : boolean {
        if (!this.largerThan(otherObj) || otherObj.form !== "ball") { // smaller objects cannot support larger objects
            // and balls cannot support anything

            if (this.form == "ball") { // balls must be in boxes
                return otherObj.form == "box";

            } else if (otherObj.form == "box") { // boxes cannot contain pyramids, planks or boxes of the same size.
                return this.form == "brick"
                    || this.form == "ball"
                    || this.form == "table"
                    || (this.form == "box" && this.smallerThan(otherObj));

            } else if (this.form == "box" && this.size == "small") {              // small boxes cannot be supported by
                return !(otherObj.form == "brick" && otherObj.size == "small"     // small bricks or
                || otherObj.form == "pyramid");                             // pyramids

            } else if (this.form == "box" && this.size == "large") {              // large boxes cannot be supported by
                return !(otherObj.form == "pyramid" && otherObj.size == "large"); // large pyramids
            }
        }

        return false;
    }

    largerThan(otherObj : ObjectDefinition) : boolean {
        return this.size == "large" && otherObj.size == "small";
    }

    smallerThan(otherObj : ObjectDefinition) : boolean {
        return this.size == "small" && otherObj.size == "large";
    }

    toString() : string {
        return this.form + ", " + this.size + ", " + this.color + ".";
    }
}