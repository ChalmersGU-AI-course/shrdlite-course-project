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
        if(otherObj.form !== "ball") {          // balls cannot support anything
            if (!this.largerThan(otherObj)) {   // smaller objects cannot support larger objects

                if (this.form === "ball") { // balls must be in boxes
                    return otherObj.form === "box";

                } else if (otherObj.form === "box") { // boxes cannot contain pyramids, planks or boxes of the same size.
                    return  this.form !== "pyramid" &&
                            this.form !== "plank" &&
                            !(this.form === "box" && this.size === otherObj.size);
                } else if (this.form === "box") {
                    switch(this.size) {
                        case "small":
                            return  !(otherObj.form === "brick" && otherObj.size === "small") &&
                                    otherObj.form !== "pyramid";
                        case "large":
                            return !(otherObj.form === "pyramid" && otherObj.size === "large");
                    }
                }

                return true;
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