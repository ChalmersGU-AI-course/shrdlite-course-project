# Make
From this folder run:
```
browserify browserify.js -o bundle.js
```
After you have updated any .js file to update the browser bundle.

# API
The planner wants the goal in one of the forms:

`[rule1, rule2, ..., ruleN]` where a goal state is satisfied if all rules are satisfied. A rule looks like this:

`rule1 = {rel: "ontop", item: 'e', oneof: ['k', 'j']}`
This means e should be ontop of either k or j. Oneof should always be an array.
It works similarily for rel: left, right and beside.

If rel:floor or rel:holding. oneof should not be set.

### Example
```
var rules = [{rel: 'ontop', item:'e', oneof:['k']},
             {rel: 'floor', item:'l'}
            ];
```

e should be on top of k, and l should be on the floor.
