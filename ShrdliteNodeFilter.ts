///<reference path="Graph.ts"/>
///<reference path="World.ts"/>

class ShrdliteNodeFilter implements GraphFilter {
    public constructor(protected intptr: Interpreter.Literal) {

    }
    public costTo(node: ShrdliteNode): number {
        switch (this.intptr.rel) {
            case 'holding':
                if (node.state.holding == this.intptr.args[0]) {
                    return 0;
                }
                else {
                    //Cost is the number of objects above the object to take
                    for (var i = 0; i < node.state.stacks.length; ++i) {
                        var pos = node.state.stacks[i].indexOf(this.intptr.args[0])
                        if (pos != -1)
                            return node.state.stacks[i].length - pos;
                    }
                }
                break;
            case 'ontop':
            case 'inside':
                var noOfObjectsAbove = 1; //Must be one (it can hold the object)
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var below = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    var onTop = node.state.stacks[i].indexOf(this.intptr.args[0]);

                    if ((below != -1 || this.intptr.args[1] == 'floor') && onTop != -1 && below + 1 == onTop)
                        return 0;

                    if (below != -1)
                        noOfObjectsAbove += node.state.stacks[i].length - below - 1; //-1 because last index is not equally to length (this will not be called if below is the floor)
                    if (onTop != -1)
                        noOfObjectsAbove += node.state.stacks[i].length - onTop - 1; //Now we want one more for the cost
                }
                return noOfObjectsAbove;
                break;
            case 'above':
                var noOfObjectsAboveTarget = 1; //Must be one
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var below = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    var onTop = node.state.stacks[i].indexOf(this.intptr.args[0]);

                    if ((below != -1 || this.intptr.args[1] == 'floor') && onTop != -1 && below < onTop)
                        return 0;
                    else if (onTop != -1) {
                        noOfObjectsAboveTarget += node.state.stacks[i].length - onTop - 1;
                    }
                }
                return noOfObjectsAboveTarget;
                break;
            case 'beside':
                for (var i = 1; i < node.state.stacks.length; ++i) {

                    var arg0 = this.intptr.args[0];
                    var arg1 = this.intptr.args[1];

                    var obj11 = node.state.stacks[i-1].indexOf(arg0);
                    var obj21 = node.state.stacks[i].indexOf(arg1);

                    var obj12 = node.state.stacks[i - 1].indexOf(arg1);
                    var obj22 = node.state.stacks[i].indexOf(arg0);

                    //leftof or rightoff

                    if ((obj11 != -1 && obj21 != -1) || (obj12 != -1 && obj22 != -1))
                        return 0;
                }
                break;
            case 'leftof':
                var noOfObjectsAboveLeft = 1;
                var noOfObjectsAboveRight = 1;

                for (var i = 1; i < node.state.stacks.length; ++i) {
                    if (i % node.state.rowLength == 0)
                        continue;
                    var leftObject: number = node.state.stacks[i - 1].indexOf(this.intptr.args[0]);
                    var rightObject: number = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    if (leftObject != -1 && rightObject != -1)
                        return 0;

                    if (leftObject != -1)
                        noOfObjectsAboveLeft += node.state.stacks[i - 1].length - leftObject - 1;
                    if (rightObject != -1)
                        noOfObjectsAboveRight += node.state.stacks[i].length - rightObject - 1;
                }
                return Math.min(noOfObjectsAboveLeft, noOfObjectsAboveRight); //Atleast one of them needs to be moved
                break;
            case 'rightof':
                var noOfObjectsAboveLeft = 1;
                var noOfObjectsAboveRight = 1;

                for (var i = 1; i < node.state.stacks.length; ++i) {
                    if (i % node.state.rowLength == 0)
                        continue;
                    var leftObject: number = node.state.stacks[i - 1].indexOf(this.intptr.args[1]);
                    var rightObject: number = node.state.stacks[i].indexOf(this.intptr.args[0]);
                    if (leftObject != -1 && rightObject != -1)
                        return 0;

                    if (leftObject != -1)
                        noOfObjectsAboveLeft += node.state.stacks[i - 1].length - leftObject - 1;
                    if (rightObject != -1)
                        noOfObjectsAboveRight += node.state.stacks[i].length - rightObject - 1;
                }
                return Math.min(noOfObjectsAboveLeft, noOfObjectsAboveRight); //Atleast one of them needs to be moved
                break;
            case 'under':
                var noOfObjectsAboveTarget = 1; //Must be one
                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var below = node.state.stacks[i].indexOf(this.intptr.args[0]);
                    var onTop = node.state.stacks[i].indexOf(this.intptr.args[1]);

                    if ((below != -1 || this.intptr.args[0] == 'floor') && onTop != -1 && below < onTop)
                        return 0;
                    else if (onTop != -1)
                        noOfObjectsAboveTarget += node.state.stacks[i].length - onTop - 1;
                }
                return noOfObjectsAboveTarget;
                break;
            case 'infront':
                var noOfObjectsAboveBack = 1;
                var noOfObjectsAboveFront = 1;
                for (var i = node.state.rowLength; i < node.state.stacks.length; ++i) {
                    var behind = node.state.stacks[i].indexOf(this.intptr.args[1]);
                    var infront = node.state.stacks[i - node.state.rowLength].indexOf(this.intptr.args[0]);

                    if (infront != -1 && behind != -1)
                        return 0;

                    if (infront != -1)
                        noOfObjectsAboveFront += node.state.stacks[i - node.state.rowLength].length - infront - 1;
                    if (behind != -1)
                        noOfObjectsAboveBack += node.state.stacks[i].length - behind - 1;
                }
                return Math.min(noOfObjectsAboveBack, noOfObjectsAboveFront); //Atleast one of them needs to be moved
                break;
            case 'behind':
                var noOfObjectsAboveBack = 1;
                var noOfObjectsAboveFront = 1;
                for (var i = node.state.rowLength; i < node.state.stacks.length; ++i) {
                    var behind = node.state.stacks[i].indexOf(this.intptr.args[0]);
                    var infront = node.state.stacks[i - node.state.rowLength].indexOf(this.intptr.args[1]);

                    if (infront != -1 && behind != -1)
                        return 0;

                    if (infront != -1)
                        noOfObjectsAboveFront += node.state.stacks[i - node.state.rowLength].length - infront - 1;
                    if (behind != -1)
                        noOfObjectsAboveBack += node.state.stacks[i].length - behind - 1;
                }
                return Math.min(noOfObjectsAboveBack, noOfObjectsAboveFront); //Atleast one of them needs to be moved
                break;
            case 'stack':
                var max = 0;

                for (var i = 0; i < node.state.stacks.length; ++i) {
                    var no = 0;
                    for (var k = 0; k < node.state.stacks[i].length; ++k) {
                        var obj = node.state.stacks[i][k];
                        if (this.intptr.args.indexOf(obj) == -1)
                            break;
                        else
                            ++no;
                    }
                    if (no > max)
                        max = no;
                }

                return this.intptr.args.length - max;
                break;
            default:
                throw new Error("I do not know what that is.");
                return 0;
                break;
        }
        return 1;
    }
}