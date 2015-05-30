/// <reference path="../lib/tsUnit.ts" />
/// <reference path="../WorldState.ts" />

module WorldStateTests {
    export class WorldStateTest extends tsUnit.TestClass {

        addObjectToWorldTest() {
            var state = new WorldState([[]], null, 0, {}, []);


            this.isTrue(state.stackHeight(0) == 0);

            state.addObject(0, "blw", new ObjectDefinition("ball", "large", "white"));

            this.isTrue(state.stackHeight(0) == 1);
        }

    }
}