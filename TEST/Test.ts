
/// <reference path="Other.ts" />
/// <reference path="lib/collections.ts" />

// import otherMod = require('./Other');

// module testMod{
//
// }

var x = new collections.Set<number>();
x.add(123);
x.add(123); // Duplicates not allowed in a set
// The following will give error due to wrong type:
// x.add("asdf"); // Can only add numbers since that is the type argument.

var y = new collections.Set<number>();
y.add(456);
x.union(y);

console.log(x.toString()); // [123,456]

// Other.hej();
// hej();
//
var show = "Hello World!!!" ;

// show = hej();
show = x.toString();

function testMain(){
    document.getElementById("demo").innerHTML = show;
}
