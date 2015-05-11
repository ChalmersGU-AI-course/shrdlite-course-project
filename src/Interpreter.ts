///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if (intprt.intp) interpretations.push(intprt);
        });
        if (interpretations.length) {
            return interpretations;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }


    export interface Result extends Parser.Result {intp:Literal[][];}
    export interface Literal {pol:boolean; rel:string; args:string[];}


    export function interpretationToString(res : Result) : string {
        return res.intp.map((lits) => {
            return lits.map((lit) => literalToString(lit)).join(" & ");
        }).join(" | ");
    }

    export function literalToString(lit : Literal) : string {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }


    export class Error implements Error {
        public name = "Interpreter.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        // This returns a dummy interpretation involving two random objects in the world

        // check if object exits
        if (!recusiveCheckExistance(cmd.ent.obj, state)) return null;


        // var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        // var a = objs[getRandomInt(objs.length)];
        // var b = objs[getRandomInt(objs.length)];

		var worldLit=worldToLiteral(state);
		debugger;

        var intprt : Literal[][] = [[
            // {pol: true, rel: "ontop", args: [a, "floor"]},
            // {pol: true, rel: "holding", args: [b]}
        ]];
        return intprt;
    }

    function recusiveCheckExistance(obj : Parser.Object, state : WorldState) : Parser.Object[] {
      debugger
      if ("obj" in obj) {
        // TODO
        // rel: "inside",
        // var matches = objectExists(obj, state)
        return []; // recusiveCheckExistance(obj.loc.ent.obj, state);
      } else {
        return objectExists(obj, state);
      }
    }

    function objectExists(objA : Parser.Object, state : WorldState) : Parser.Object[] {
      var matches = [];
      for (var o in state.objects) {
        var objB = state.objects[o];
        if (
          (!objA.size  || objB.size  == objA.size) &&
          (!objA.color || objB.color == objA.color) &&
          (objA.form == "anyform"  || objB.form  == objA.form)
        ) matches.push(objB);
      }
      return matches;
    }
    
    
    // Returns list of literals that represent a PDDL Representation of the world
    // portrait in state variable
    // 
    // Relations considered: 
    //		ontop	above	under	right		left	beside
    //
    // TODO - decide if we wish to use all of them
    //
    
       function worldToLiteral(state : WorldState) : Literal[] {
    
       var worldLiterals = [];
       var stcks= state.stacks;
       var leftObjs = [];           // 
       var besideObjs = [];         //
    
    
    	// Iterates through stacks 
		for (var c in stcks) // #1
			{
                
		        var col=stcks[c];
		    	var underObjs = [];         //
		    	var iter=0;
		     		
		     	// Iterates through objects in given stack       
		    	for (var obj in col) // #2
					{
				
				
					
					 	var o=col[obj];
					 	var topRelation;
					 	
					 	
		        		if(iter==0)
		             		{
		             			//adds ontop relation for 1st object (floor)
					 			//TODO - Add number of floor space (number of column) - easy, gg 
		             	   	 	topRelation={pol: true, rel: "ontop", args: [o, "floor"]}; 
						 	    worldLiterals.push(topRelation);
		    		 		}
		    		 	else
		    		 		{
		    		 	    	var last=underObjs.length-1;
		    		 	    	var under=underObjs[last];
		    		 	    
		    		 	    	//only box can have inside objects, the remaining are ontop
		    		 	    	//TODO - ask if two boxes of same size can be ontop of each other
						 	    if(state.objects[under].form=="box")  topRelation={pol: true, rel: "inside", args: [o, under]};  //box is the only form that can contain other objects
						 	    else topRelation={pol: true, rel: "ontop", args: [o, under]};  // any other (valid) form has objects ontop and not inside
						 	    
						 	    worldLiterals.push(topRelation);
						
		    		 	        
						 	    for(var uObj in underObjs) // #3
							 	    {
							 	        var u=underObjs[uObj];
							 	        // TODO ??? what's inside is also above? 
	  									// ??? what's "outside" is also under? 
	  									// ??? decide if both are necessary 
							 	    	var abvRelation={pol: true, rel: "above", args: [o, u]}; 
							 	    	var undRelation={pol: true, rel: "under", args: [u, o]};  
							 	    	worldLiterals.push(abvRelation);
							 	    	worldLiterals.push(undRelation);
							 	    } //end for #3
		    		 	      
		    		 		} //end else 
		    		 	
		    		 	
		    		 	// add horizontal position relations
		    		 	for(var lObj in leftObjs)  //#4
		    		 		{
		    		 		    var leftO=leftObjs[lObj];
		    		 			var leftRelation={pol: true, rel: "left", args: [leftO , o]}; 
		    		 			var rightRelation={pol: true, rel: "right", args: [o, leftO]};  // TODO ??? decide if both are necessary 
		    		 			worldLiterals.push(leftRelation);
		    		 			worldLiterals.push(rightRelation);
		    		 		} //end for #4
		    		 		 
		    		    // add beside relations
		    		 	for(var besideO in besideObjs)  //#5
		    		 		{
		    		 		    var besO=besideObjs[besideO]
		    		 			var besideRelation={pol: true, rel: "beside", args: [besO , o]}; 
		    		 			worldLiterals.push(besideRelation);
		    		 		} //end for #5
		    		 	
		    		 	iter++;
		    		 	underObjs.push(o); 
		    		 	
		    		} //end inside for #2
		    
		        //update lists for next stack
		    	leftObjs=leftObjs.concat(underObjs);  //add objects from previously examined stack
		    	besideObjs=underObjs;	
        
        } //end outside for #1
    
      return worldLiterals;
    }


    // Checks if a given literal is valid
    // This implements some of the physics laws (not all, since some are not aplicable to only one literal)  
    
	function checkLiteral(world : WorldState, lit: Literal) : any
		{
	
			//var relations = ["ontop", "above", "under", "right", "left", "beside", "inside", "holding"];
    		var rel=lit.rel;
			var objs=world.objects;
    		//var rIndex =relations.indexOf(rel);
     
    		switch(rel) 
    			{
    				case "ontop": //ontop
    				
    					var objA = objs[ lit.args[0] ];
    					var objB = objs[ lit.args[1] ];
    					if(objB.form=="ball") return { val: false , str:"Balls can not support anything" };
    					else if(objA.form=="ball" && objB.form!="floor") return { val: false , str:"Balls can only be inside boxes or on top of the floor" };
    					else if(objA.size=="large" && objB.size =="small") return { val: false , str:"Small objects can not support large objects" };
    					else if(objA.form=="box" && objA.size=="small" && objB.size=="small" && (objB.form=="pyramid" || objB.form=="brick") )
    						return { val: false , str:"Small boxes can not be supported by small bricks or pyramids" };				
    					else 	if(objA.form=="box" && objA.size=="large" && objB.size=="large" && objB.form=="pyramid" )
    						return { val: false , str:"Large boxes can not be supported by large pyramids" };	
    					else return { val:true , str: "" };
    				
    				case "above": //above
    				
    					return { val:true , str: "" };
    				
    				case "under": //under
    				
    					var objA = objs[ lit.args[0] ];
    					var objB = objs[ lit.args[1] ];
    					if(objA.form=="ball") return { val: false , str:"Balls can not support anything" };
    					else return { val:true , str: "" };
    				
    				case "right": //right
    				
    					return { val:true , str: "" };
    					
    				case "left": //left
    				
    					return { val:true , str: "" };
    					
    				case "beside": //beside
    				
    					return { val:true , str: "" };
    				
    				case "inside": //inside
    				
    					var objA = objs[ lit.args[0] ];
    					var objB = objs[ lit.args[1] ];
    					if(objA.form!="box") return { val: false , str:"Only boxes can contain other objects" };
    					else if(objA.size==objB.size && ( objB.form=="pyramid" || objB.form=="planks" ||objB.form=="box") ) 
    						return { val: false , str:"Boxes can not contain pyramids, planks or boxes of the same size" };
    					else return { val:true , str: "" };
    					
    				case "holding": //holding
    				
    					return { val:true , str: "" };		
    				
    				default: 	
    				
    					return { val:true , str: "" };		
    			
    			} //end switch-case
    			
    		return { val:true , str: "" };		
    			
		}
		

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
