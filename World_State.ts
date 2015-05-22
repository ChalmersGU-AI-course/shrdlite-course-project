
    class Neighbour<T> {
        constructor (
            public State: T,
            public Cost: number,
            public Decission?: string
        ){}
    }

    class State implements State_Node<State> {
        constructor(public State: WorldState) {}
        
        modify_world(stacks: string[][]): State {
            return new State({stacks: stacks,holding: this.State.holding, 
                arm: this.State.arm, objects: this.State.objects, 
                examples: this.State.examples});
        }

        get_Neighbour_Nodes() : Neighbour<State>[] {
            var neighbour_nodes: Neighbour<State>[] = [];

            if (this.State.holding && this.check_physical_laws_drop()) {
                var modified_stack = this.State.stacks.map(function(stack) {return stack.slice();});
                modified_stack[this.State.arm].push(this.State.holding);
                var modified_world = this.modify_world(modified_stack);
                modified_world.State.holding = null;
                neighbour_nodes.push(new Neighbour<State>(modified_world, 1, "d"));
            }

            if (!this.State.holding && this.get_object_on_top(this.State.arm) != null) {
                var modified_stack = this.State.stacks.map(function(stack) {return stack.slice();});
                var holding = modified_stack[this.State.arm].pop();
                var modified_world = this.modify_world(modified_stack);
                modified_world.State.holding = holding;
                neighbour_nodes.push(new Neighbour<State>(modified_world, 1, "p"));
            }

            if (this.State.arm > 0) {  // checking if we can go Left
                var modified_world = this.modify_world(this.State.stacks);
                modified_world.State.arm -= 1;
                neighbour_nodes.push(new Neighbour<State>(modified_world, 1, "l"));
            }

            if (this.State.arm < this.State.stacks.length - 1) {  // checking if we can go Right
                var modified_world = this.modify_world(this.State.stacks);
                modified_world.State.arm += 1;
                neighbour_nodes.push(new Neighbour<State>(modified_world, 1, "r"));
            }
            return neighbour_nodes;
        }

        check_physical_laws_drop(): boolean {
            var object_in_arm = this.State.objects[this.State.holding];
            var target = this.get_object_on_top(this.State.arm);

            //If there is no target object, then the target object is the floor.
            if (!target) {
                target = {
                    form: "floor",
                    size: null,
                    color: null,
                };
            }
            //Balls cannot support anything.
            if (target.form == "ball") {
                return false;
            }
            //Small objects cannot support large objects.
            if(target.size == "small" && object_in_arm.size =="large"){
                return false;
            }
            //Balls must be in boxes or on the floor, otherwise they roll away.
            //TODO check if baseobject is floor
            if(object_in_arm.form == "ball" && !(target.form == "box" || target.form == "floor")){
                    return false;
            }
            //Boxes cannot contain pyramids, planks or boxes of the same size.
            if(target.form == "box" && 
              (object_in_arm.form == "pyramid" || object_in_arm.form =="plank" ||
              (object_in_arm.form == "box" && target.size == object_in_arm.size))){
                return false;
            }
            //Small boxes cannot be supported by small bricks or pyramids.
            if(object_in_arm.size == "small" && object_in_arm.form == "box" && 
              (target.form == "brick" ||target.form == "pyramid")){
                return false
            }

            //Large boxes cannot be supported by large pyramids.
            if(target.form == "pyramid" && target.size == "large" &&
               object_in_arm.form == "box" && object_in_arm.size == "large"){
                return false;
            }
            return true;
        }

        get_objects_on_top(obj: string): string[] {
            var object_location = this.locate_object(obj);
            if (!object_location) {
                return [];
            }
            var objects_stack = this.State.stacks[object_location.location];
            var objects_on_top = [];
            for (var i = object_location.height + 1; i < objects_stack.length; i++) {
                objects_on_top.push(objects_stack[i]);
            }
            return objects_on_top;
        }

        get_object_on_top(location: number): ObjectDefinition {
            var objects_stack = this.State.stacks[location];

            for (var i = objects_stack.length - 1; i >= 0; i--) {
                if (objects_stack[i]) {
                    return this.State.objects[objects_stack[i]];
                }
            }
            return null;
        }

        get_object_location(obj: string): number {
            if (this.locate_object(obj)) {
                return this.locate_object(obj).location;
            }
            else if (this.State.holding == obj) {
                return this.State.arm;
            }
            else
                return null;
        }

        locate_object(obj: string): Object_Location {
            for (var i = 0; i < this.State.stacks.length; i++) {
                var objects_stack = this.State.stacks[i];
                for (var j = 0; j < objects_stack.length; j++) {
                    if (objects_stack[j] == obj) {
                        return new Object_Location(i, j);
                    }
                }
            }
            return null;
        }
        
        toString() : string {
            return this.State.stacks.toString() + this.State.holding + this.State.arm;
        }
    }

    class Object_Location {
        constructor(
            public location: number,
            public height: number
        ) {}
    }