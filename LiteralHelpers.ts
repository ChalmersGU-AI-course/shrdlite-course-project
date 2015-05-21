///<reference path="Interpreter.ts"/>

module LiteralHelpers {

    export function areLiteralsFulfilled(orPart: Interpreter.Literal[][], state: WorldState): boolean {
        var result = false;

        // OR part
        orPart.forEach(function(andPart: Interpreter.Literal[]) {
            var andPartFulfilled = true;

            // AND part
            andPart.forEach(function(lit: Interpreter.Literal) {
                andPartFulfilled = andPartFulfilled && isLiteralFullfilled(lit, state);
            });

            if (andPartFulfilled) {
                result = true;
            }
        });

        return result;
    }

    export function isLiteralFullfilled(lit: Interpreter.Literal, state: WorldState): boolean {
        if (lit.rel == "ontop" || lit.rel == "inside") {
            return checkOntopLiteral(lit, state);
        }
        if (lit.rel == "holding") {
            return checkHoldingLiteral(lit, state);
        }
        if (lit.rel == "under") {
            return checkUnderLiteral(lit, state);
        }
        if (lit.rel == "beside") {
            return checkBesideLiteral(lit, state);
        }
        if (lit.rel == "above") {
            return checkAboveLiteral(lit, state);
        }
        return false;
    }

    export function checkOntopLiteral(lit: Interpreter.Literal, state: WorldState): boolean {
        var on = lit.args[0];
        var under = lit.args[1];

        // check all stacks
        for (var i = 0; i < state.stacks.length; ++i) {
            var stack = state.stacks[i];

            // if stack contains items
            if (stack) {
                var position = stack.indexOf(on);
                // item on floor
                if (position == 0 && under == "floor") {
                    return true;
                }
                // item on top of other item
                if (position > 0) {
                    var positionUnder = stack.indexOf(under);
                    if (positionUnder == position - 1) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    export function checkHoldingLiteral(lit: Interpreter.Literal, state: WorldState): boolean {
        return state.holding == lit.args[0];
    }

    export function checkUnderLiteral(lit: Interpreter.Literal, state: WorldState): boolean {
        var swapLiteral = { pol: lit.pol, rel: lit.rel, args: [lit.args[1], lit.args[0]] };
        return checkAboveLiteral(swapLiteral, state);
    }

    export function checkAboveLiteral(lit: Interpreter.Literal, state: WorldState): boolean {
        var posOn = getPositionOfObject(lit.args[0], state);
        var posUnder = getPositionOfObject(lit.args[1], state);

        if (posOn && posUnder) {
            return (posOn[0] == posUnder[0] && posOn[1] > posUnder[1]);
        }
        return false;
    }

    export function checkBesideLiteral(lit: Interpreter.Literal, state: WorldState): boolean {
        var pos1 = getPositionOfObject(lit.args[0], state);
        var pos2 = getPositionOfObject(lit.args[1], state);

        if  (pos1 && pos2) {
            return (Math.abs(pos1[0] - pos2[0]) == 1);
        }
        return false;
    }



    export function getPositionOfObject(item: string, state: WorldState): number[] {
        // check all stacks
        for (var i = 0; i < state.stacks.length; ++i) {
            var stack = state.stacks[i];

            // if stack contains items
            if (stack) {
                var position = stack.indexOf(item);
                // if item in stack, get position
                if (position >= 0) {
                    return [i, position];
                }
            }
        }
        return null;
    }
}