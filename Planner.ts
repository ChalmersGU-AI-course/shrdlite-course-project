///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>

class Shortestpath implements Graph<number[]>{   // index 0 = x, index 1 = y
     _nodeValues : Array<WorldState>;
    _nodeneighbors : Array<Array<WorldState>>;   //neighboring nodes to index node 
    _edges : Array<Array<WorldState>>;        //from index node a to index node b
    //_width : number;
    //_heigth : number;
    _heuristicWeight : number;

    constructor(heuristic:number){
        this._heuristicWeight = heuristic;
        
        this._nodeValues = [];
        var index = 0;  
                index ++;  
        
    }

   /* clone(object:any): any {
	    var objectCopy = <any>{};
	
	    for (var key in object)
	    {
	        if (object.hasOwnProperty(key))
	        {
	            objectCopy[key] = object[key];
	        }
	    }
	
	    return objectCopy;
	}*/
	cloneWorld(world :WorldState):WorldState{
		var newworld : WorldState = {
			"stacks": [[""]],
    		"pddl": this.cloneSet(world.pddl),
    		"holding": this.clone<string>(world.holding),
    		"arm": this.clone<number>(world.arm),
    		"planAction": this.clone<string>(world.planAction),
    		"objects": world.objects,
			"examples": world.examples};
		return newworld;
	}
	
	cloneSet(pddls : collections.Set<Interpreter.Literal>):collections.Set<Interpreter.Literal>{
		var arypddls = pddls.toArray();
		var newpddls = new collections.Set<Interpreter.Literal>(function (p){		// ToString
						var res:string;
						res = p.rel + "(";
						for(var i = 0; i < p.args.length; i++){
							res = res + p.args[i] + ", "
						}
						//res = res.substring(0, res.length-2);
						res = res + ")";
				    	return res;
				    });
		for(var i = 0; i < arypddls.length; i++){
			newpddls.add(this.clone<Interpreter.Literal>(arypddls[i]));
		}
		return newpddls;
	}
	
	clone<T>(obj: T): T {
        if (obj != null && typeof obj == "object") {
            var result : T = obj.constructor();
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = this.clone<T>(obj[key]);
                }
            }
            return result;
        } else {
            return obj;
        }
    }
	getneighbors(node :number):Array<number>{
		// get current state
		console.log("getneighbors: starting");
		var currentstate : WorldState = this._nodeValues[node];
		var neig :WorldState[] = [];
		// max 3 possible states
		// move arm left
		if(currentstate.arm > 0){
			console.log("getneighbors: left");
			var possiblestate : WorldState = this.cloneWorld(currentstate);
			// reduce arm poss
			possiblestate.arm -= 1;
			possiblestate.planAction = "l";
			neig.push(possiblestate);
		}
		// move arm right
		if(currentstate.arm < this.getWorldWidth(currentstate)){
			console.log("getneighbors: right");
			var possiblestate : WorldState = this.cloneWorld(currentstate);
			// increase arm poss
			possiblestate.arm += 1;
			possiblestate.planAction = "r";
			neig.push(possiblestate);
		}
		// pick up
		var topLit = this.getTopLiteral(currentstate, currentstate.arm);
		if(!currentstate.holding && topLit){	
			console.log("getneighbors: up");
			// if it is not holding anything and ther is something on the floor
			var possiblestate : WorldState = this.cloneWorld(currentstate);
			var topobj = this.getTopObj(currentstate, currentstate.pddl.toArray());
			// set the top obj as holding
			possiblestate.holding = topobj;
			// remove top literal
			possiblestate.pddl.remove(topLit);
			possiblestate.planAction = "p";
			neig.push(possiblestate);
		}else if(currentstate.holding){ // drop
			console.log("getneighbors: down");
			var possiblestate : WorldState = this.cloneWorld(currentstate);
			// get top obj
			console.log("getneighbors: down arm" + currentstate.arm);
			console.log("getneighbors: down pddl" + currentstate.pddl.size());
			var topl = this.getTopLiteral(currentstate, currentstate.arm);
			var topobj :string;
			if(topl){
				topobj = topl.args[0];
			}else{
				topobj = "f" + currentstate.arm;
			}
			var newliteral = {pol: true, rel : "ontop", args : [possiblestate.holding, topobj]};
			if(Interpreter.checkIllegal(newliteral, currentstate)){ // check if the drop is leagal
				// remove holding obj
				possiblestate.holding = null;
				possiblestate.planAction = "d";
				// add new top literal 
				possiblestate.pddl.add(newliteral);
				neig.push(possiblestate);
			}
		}
		
		// check if we have allready been there
		neig = this.filterVissited(neig);
		
		// convert states to indexes
		var neigNumbers : number[] = [];
		for(var i = 0; i < neig.length; i++){
			this._nodeValues.push(neig[i]);
			neigNumbers.push(this._nodeValues.length-1);
		}
        console.log("getneighbors: ending")
        
        return neigNumbers;
    }
    
    filterVissited(states : WorldState[]):WorldState[]{
    	var newstates : WorldState[] = [];
    	for(var i = 0; i < states.length; i++){
    		var equals = false;
    		for(var j = 0; j < this._nodeValues.length; j++){
    			if(this.equalsWorldstate(states[i], this._nodeValues[j])){
    				equals = true;
    			}
    		}
    		if(!equals){
    			newstates.push(states[i]);
    		}
    	}
    	return newstates;
    }
    
    equalsWorldstate(state1 : WorldState, state2 : WorldState):boolean{
    	if(state1.holding != state2.holding || state1.arm != state2.arm){
    		return false;
    	}
    	var pddls1 = state1.pddl.toArray();
    	for(var i = 0; i < pddls1.length; i++){
    		if(!state2.pddl.contains(pddls1[i])){
    			return false;
    		}
    	}
    	
    	return true;
    }
    
    // gets the top literal in a column, null if no object is in the column
    getTopLiteral(state : WorldState, armposs : number): Interpreter.Literal{
    	var pddls = state.pddl.toArray();
    	var result : Interpreter.Literal;
    	// Finde floor possition and the one ontop
    	for(var i = 0; i < pddls.length; i++){
    		if(pddls[i].args[1]=="f"+armposs && pddls[i].rel == "ontop"){
    			result = this.findTopLiteral(pddls[i], pddls);
    			break;
    		}
    	}
    	return result;
    }
    
    // recursive function to follow a literal to find the one on the top
    findTopLiteral(lit : Interpreter.Literal, lits : Interpreter.Literal[] ): Interpreter.Literal{
		var result : Interpreter.Literal;
		for(var j = 0; j < lits.length; j++){
			if(lits[j].args[1] == lit.args[0] && lits[j].rel == "ontop"){
				result = lits[j];
				break;
			}
		}
		if(!result){
			return lit;
		}else{
			return this.findTopLiteral(result, lits);
		}	
    }
    
 /*   getneighbors(node :number):Array<number>{
        console.log("in get neighbor func");

        var state2 : WorldState = this._nodeValues[node];
        
        //var cur = this._nodeValues[node];
       // console.log("Narmpos: "+state.arm + " , holding: " + state.holding);
        var state = this.clone(state2);//number is not a funct..
        //var tempAct = this.clone(state.planAction);

        var neig :Array<WorldState> = [];
        var neigNumbers :Array<number> =[];
        //var found;
        //only if not it nodevalues
        console.log("stop1");
        if(state.arm > 0){
            neig.push(this.clone(state));
            neig[neig.length-1].arm = state.arm-1;
            neig[neig.length-1].planAction = "l";
        }
        console.log("stop2");
        if(state.arm < GetFloorSize(state)){
            console.log("xzczcarmpos: "+state2.arm + " , holding: " + state2.holding);
            neig.push(this.clone(state));
            neig[neig.length-1].arm = state.arm+1;
            neig[neig.length-1].planAction = "r";
            console.log("ffffffarmpos: "+state2.arm + " , holding: " + state2.holding);
        }
        console.log("stop3");
        var pddlIndex:number = this.getTopObjInd(state, state.pddl.toArray());
        console.log("topobj worked");
        console.log("pddlindex" + pddlIndex);
        console.log("printing neig: " + neig[neig.length-1].toString() );
        //world.printWorld(state.holding ? "holding" : "not holding");
        if(state.holding != null){
            console.log("if1");
            neig.push(this.clone(state));
            //Already holding, drop at position
             // find object on top at positon, set as index, add relation on top between holding
            // item and the current on top 
            var newobj : Interpreter.Literal;
             newobj = this.clone(state.pddl[state.pddl.length -1]); 
             newobj.rel = "ontop";
             newobj.args = [neig[neig.length-1].holding, this.getTopRelation(state, state.pddl.toArray()).args[0]]; // this can't be right.
             //neig[neig.length].holding = state.pddl.push(newobj)
             state.pddl.add(newobj);
             neig[neig.length-1].holding = null;
             neig[neig.length-1].planAction = "d";
        }else if( pddlIndex !=-1){//neig[neig.length-1].pddl[pddlIndex].args[0].substr(0, 1) != "f"  object in position ) {
           console.log("ANarmpos: "+state2.arm + " , holding: " + state2.holding);
            console.log("if2");
            neig.push(this.clone(state));
            //not holding, pick at position    
           //  find object on top at positon, set as index, remove relation, and add object to pddl.holding             
            neig[neig.length-1].holding = this.getTopObj(state, state.pddl.toArray());
            neig[neig.length-1].pddl.remove(this.getTopRelation (state, state.pddl.toArray())); // this may be error
            neig[neig.length-1].planAction = "p";
            console.log("ZNarmpos: "+state2.arm + " , holding: " + state2.holding);
        }
        console.log("midNarmpos: "+state2.arm + " , holding: " + state2.holding);
        for(var i = 0; i < neig.length;i++){
            var bflag:boolean = false;
            for(var j = 0; j <  this._nodeValues.length;j++){
                console.log("stop5");
                if(neig[i].arm !=  this._nodeValues[j].arm && neig[i].holding !=  this._nodeValues[j].holding){
                    //if arm is different positon, no need to check rest????
                    for(var k = 0; k < state.pddl.length;k++){
                        if(neig[i].pddl==state.pddl[k]){
                            bflag=true;
                            break;
                        }
                    }
                }
                if(bflag){break;}
            }
            if(!bflag){
                //New node did not excist before, so add it
                //if new node exist, do not return that.(no need to go back)
                console.log("NN: "+neigNumbers);
                 this._nodeValues.push(neig[i]);
                neigNumbers.push( this._nodeValues.length-1);
            }   
        }
        console.log("ENDNarmpos: "+state2.arm + " , holding: " + state2.holding);
        //Add new to nodevalues, return new indexes
        
      
        console.log("ENDNarmpos: "+state2.arm + " , holding: " + state2.holding);
        return neigNumbers; 
    } */
    
    getTopObj(state:WorldState, pddls:Interpreter.Literal[]):string{
        var ind :number= -1;
        var obj = "f" + state.arm;
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            var x = pddl.args[1];
            if(pddl.args[1] != null && (pddl.rel == "ontop" && x == obj)){
                obj = pddl.args[0];
                ind=index;
                index = -1;
            }
        }
        return obj;
    }
    
    getTopRelation(state:WorldState, pddls:Interpreter.Literal[]):Interpreter.Literal{
        var ind :number= -1;
        var fln = state.arm;
        var z = "f" + fln.toString();
        var pd;
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            var x = pddl.args[1];
            console.log("loop");
            if(pddl.args[0] == null){}
            else if(pddl.rel == "ontop" && this.equalObjects(state.objects[x], state.objects[z])){
                z = pddl.args[0];
                ind=index;
                index = -1;
                pd = pddl;

                //counter++;
            }
        }
        return pddl;
    }

    getTopObjInd(state:WorldState, pddls:Interpreter.Literal[]):number{
        var ind :number= -1;
        var fln = state.arm; 
        console.log("inside gettop");
        var z = "f" + fln.toString();
        for(var index = 0; index < pddls.length; index++){
            console.log("x: " + x + " , z: "+z);
            var pddl = pddls[index];
            var x = pddl.args[0];
            if(pddl.args[0] == null){}
            else if(pddl.rel == "ontop" && this.equalObjects(state.objects[x], state.objects[z])){
                console.log("new vals :x: " + x + " , z: "+z);
                z = pddl.args[0];
                ind= index;
                index = -1;

                //counter++;
            }
        }
        return ind;
    }


    getcost(from: number,to:number):number{
        return 1;
    }
    

    //counts objects on top of given object
    countOnTop(obj :string, state:WorldState, pddls:Interpreter.Literal[]):number{
      /*  var counter = 0;
        var z = a;
        console.log("at countontop");
         for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            var x = pddl.args[1];
            if(this.equalObjects(state.objects[x], state.objects[z])){
                z = pddl.args[0];
                index = -1;
                counter++;
            }
        }
        console.log("returning from countontop");
        return counter;*/
        var lit = this.findObjLiteral(obj, state);
        // if obj is ontop then this is the top obj and no one is above
        if(lit.args[0] == obj){
        	return 0;
        }
        return this.countOnTopHelper(0, lit, pddls);
    }
    
    countOnTopHelper(counter : number, lit : Interpreter.Literal, lits : Interpreter.Literal[] ):number{
		var result : Interpreter.Literal;
		for(var j = 0; j < lits.length; j++){
			if(lits[j].args[1] == lit.args[0] && lits[j].rel == "ontop"){
				result = lits[j];
				counter++;
				break;
			}
		}
		if(!result){
			return counter ; // for the last one
		}else{
			return this.countOnTopHelper(counter, result, lits);
		}	
    }

    amountOfTiles(a:string, state:WorldState, pddls:Interpreter.Literal[]){
        var counter = 0;
        counter += this.getPosition(a,state);
        
        var floor;
        var x = a;
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            if(this.equalObjects(state.objects[pddl.args[0]], state.objects[x])){
                if(state.objects[pddl.args[1]].form == "floor") {
                    //found floor
                    floor = pddl.args[1];//----------------------------------
                }
                else{
                    x = pddl.args[1];
                    index = -1;
                }
            }
        }
        //time to move rightwards along the floors
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            if(pddl.rel == "rightof" &&  this.equalObjects(state.objects[pddl.args[1]], state.objects[floor])){
                floor = pddl.args[0];
                index = -1;
                counter ++;
            }
        }
        return counter;
    }


    //returns x-pos (0->x) for object a
    findPosition_old(obj : string, state : WorldState, pddls : Interpreter.Literal[]):number{
		console.log("at findPosition, a =" + obj);
		var x = obj;// this.clone(a);
		var position = 0;
		var floor : string = "f" + state.arm;
		console.log("at findPosition, x =" + x);

		console.log("floor: " + floor);
		//time to move leftwards along the floors
		for(var index = 0; index < pddls.length; index++){
		    var pddl = pddls[index];
		    // Find floor under which is under the arm
		    if(pddl.rel == "leftof" && pddl.args[1]== floor){// this.equalObjects(state.objects[pddl.args[1]], state.objects[floor])){
		        floor = pddl.args[0];
		        index = -1;
		        position ++;
		
		    }
		    if(floor == "f0"){
		        console.log("returning from findPosition1");
		        return position;
		    }
		}
		return position;//should never happen
    }
    
    findObjLiteral(obj : string, state : WorldState): Interpreter.Literal{
    	var pddls = state.pddl.toArray();
    	for(var i = 0; i < pddls.length; i++){
    		// first try to find the litterl where obj is arg 1
    		if(pddls[i].args[1] == obj){
    			return pddls[i];
    		}
    	}
    	for(var i = 0; i < pddls.length; i++){
    		// second try to find the litterl where obj is arg 0 
    		//(means that it is on the top or at the edge of the world if floor.)
    		if(pddls[i].args[0] == obj){
    			return pddls[i];
    		}
    	}
    	return null;
    }
    
    getPosition(obj : string, state : WorldState): number{
    	var pddls = state.pddl.toArray();
    	var counter = 0;
    	// Finde floor possition and the one ontop
    	for(var i = 0; i < pddls.length; i++){
    		//check if we found a floor relation
    		if(state.objects[pddls[i].args[1]].form =="floor" && pddls[i].rel == "ontop"){
    			if(this.containsObj(obj, pddls[i], pddls)){
    				return this.getFloorPosition(pddls[i].args[1], state);
    			}
    		}
    	}
    	// Nothing found
    	return -1;
    }
    
    getFloorPosition(floor : string, state):number{
    	for(var i = 0; i < this.getWorldWidth(state); i++){
    		if(floor == "f"+i){
    			return i;
    		}
    	}
    }
    
    // recursive function to follow a literal to find the one on the top
    containsObj(obj : string, lit : Interpreter.Literal, lits : Interpreter.Literal[] ): boolean{
    	var result : Interpreter.Literal;
		for(var j = 0; j < lits.length; j++){
			if(lits[j].args[1] == lit.args[0] && lits[j].rel == "ontop"){
				result = lits[j];
				break;
			}
		}
		if(!result){
			return false;
		}else if(result.args[0] == obj){
			return true;
		}else{
			return this.containsObj(obj, result, lits);
		}
    }
    
    
    equalObjects(a : ObjectDefinition, b : ObjectDefinition):boolean{
       // if(a == null || b == null)
         //   return true;
        if(a.form == b.form && a.color == b.color && a.size == b.size)
            return true;
        return false;
    }

    heuristic_cost_estimate(current:number, goal:Interpreter.Literal[]):number{
        var count = 0;
        for(var i = 0; i < goal.length; i++ ){
            console.log("starting heur loop");
            if(goal[i] != null){
                console.log("wasnt null");
                count += this.heuristic_cost(current, goal[i]);

            }
        }
        console.log("finished heur");
        console.log("armpos: "+ this._nodeValues[current].arm + " , holding: " +  this._nodeValues[current].holding);
        return count;
    }

    heuristic_cost(current:number, goal:Interpreter.Literal):number{//some parts can be improved
        var cond = goal;
        var state = this._nodeValues[current];
        console.log("printing a: "+cond.args[0]+", b: " +cond.args[1] );
        var ao = state.objects[cond.args[0]];
        var a = cond.args[0];
        var pddls = state.pddl.toArray();
        var count = 0;
        var samePile:boolean = false;
        console.log("at heuristics");

        
        console.log("11armpos: "+state.arm + " , holding: " + state.holding);
        if(cond.rel == "hold"){
            console.log("at hold1");
            if(state.holding != null){
                console.log("at hold2");
                if(this.equalObjects(state.objects[state.holding], ao)){
                    return 0;
                }
                else{
                    return this.countOnTop(a,state,pddls)*4 + Math.abs(this.getPosition(a,state)-state.arm-1) +1;//should maybe be +2..
                }
            }
            else{
                console.log("not holding an object: " +state.holding);
                return this.countOnTop(a,state,pddls) + Math.abs(this.getPosition(a,state)-state.arm);
            }
        }
        console.log("after hold");
        var bo = state.objects[cond.args[1]];
        var b = cond.args[1];
        console.log("a: " + a + ", b: " + b + ", hold: " + state.holding);

        if(cond.rel == "ontop" || cond.rel == "inside"){
            //if a above b, take #objects on b * 4 + (ifnotinsamepile)#objects on a*4 + distancefromcrane to a + distancefromatob
            if(state.holding != null && this.equalObjects(state.objects[state.holding], state.objects[a]) && this.countOnTop(b,state,pddls) == 0){//check if a's stack is full
                return 1 + Math.abs(this.getPosition(b,state) - state.arm);
            }
            else if(state.holding != null && this.equalObjects(state.objects[state.holding], state.objects[b])){
                return 1+ this.countOnTop(a,state,pddls)*4 + Math.abs(this.getPosition(a,state)-state.arm)+2;
            }
            
            var z = b;
            //traverse up through b;
            for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[1];
                if(this.equalObjects(state.objects[x], state.objects[z])){
                    if(this.equalObjects(state.objects[pddl.args[0]], ao)){
                        if(this.equalObjects(state.objects[pddl.args[1]],bo))
                            return 0;
                        samePile = true;

                    }
                    else{
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    }
                }

            }
            //if a is not in the same pile as b, check how many objects on top of a
            if(!samePile){
                z= a;//z ==a...
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[1];
                    if(this.equalObjects(state.objects[x],state.objects[z])){
                       
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    
                    }

                }
                //check distance from crane to a + distance from a to b, also multiply count by 4(number of moves for each object)
                count = count * 4 + Math.abs(this.getPosition(a,state)-state.arm) + Math.abs(this.getPosition(a,state)
                 - this.getPosition(b,state));
                

            }
            else{
               count = count*4 + Math.abs(this.getPosition(a,state) - state.arm) + 3;//if they are in the same pile but not finished, a will require 3 more moves to get back
            }
            return count; 

        }
        else if(cond.rel == "above"){
            if(state.holding != null && this.equalObjects(state.objects[state.holding], ao)){
                return 1 + Math.abs(this.getPosition(b,state) - state.arm);
            }
            else if(state.holding != null && this.equalObjects(state.objects[state.holding], bo)){
                return 1+ this.countOnTop(a,state,pddls)*4 + Math.abs(this.getPosition(a,state)-state.arm)*2;
            }
            if(this.getPosition(a,state) == this.getPosition(b,state) && this.getPosition(b,state) > this.countOnTop(a,state,pddls))//check if completed
                return 0;
            var z = a;
            //traverse up through a;
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[1];
                if(this.equalObjects(state.objects[x],state.objects[z])){
                    if(this.equalObjects(state.objects[ pddl.args[0]], bo))
                        samePile = true;
                    else{
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    }
                }

            }
            count = count*4;
            if(this.getPosition(a,state) == this.getPosition(b,state))
                   count += 3 + Math.abs(this.getPosition(b,state) - state.arm);
            else{
                count += Math.abs(this.getPosition(a,state)-state.arm) + Math.abs(this.getPosition(a,state)-this.getPosition(b,state));
            }

            return count;
        }
        else if(cond.rel == "under"){
            if(state.holding != null && this.equalObjects(state.objects[state.holding], bo)){//check if a's stack is full
                return 1 + Math.abs(this.getPosition(a,state) - state.arm);
            }
            else if(state.holding != null && this.equalObjects(state.objects[state.holding], ao)){
                return 1+ this.countOnTop(b,state,pddls)*4 + Math.abs(this.getPosition(b,state)-state.arm)*2;
            }
            if(this.getPosition(a,state) == this.getPosition(b,state) && this.countOnTop(b,state,pddls) < this.countOnTop(a,state,pddls))
                return 0;
            var z = cond.args[0];
            //traverse up through b;
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[1];
                if(this.equalObjects(state.objects[x],state.objects[z])){
                    if(this.equalObjects(state.objects[pddl.args[0]], ao))
                        samePile = true;
                    else{
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    }
                }

            }
            count = count*4;
            if(this.getPosition(a,state) == this.getPosition(b,state))
                count += 3 + Math.abs(this.getPosition(b,state) - state.arm);
            else{
                count += Math.abs(this.getPosition(b,state)-state.arm) + Math.abs(this.getPosition(a,state)-this.getPosition(b,state));
            }

            return count;
        }
        else if(cond.rel == "rightof"){//currently not handling if B is in holding

            if(state.holding != null && this.equalObjects(state.objects[state.holding], ao) && this.getPosition(b,state) != this.amountOfTiles(b,state,pddls)){
                return Math.abs(this.getPosition(b,state)-state.arm+1); // currently not checking if stack next to b is full

            }
            else if(state.holding != null && this.equalObjects(state.objects[state.holding], bo)){
                return 1+ this.countOnTop(a,state,pddls)*4 + Math.abs(this.getPosition(a,state)-state.arm)*2;
            }

            if(this.getPosition(b,state) == this.amountOfTiles(b,state,pddls)){//not perfect
                count = this.countOnTop(a,state,pddls)*4 + this.countOnTop(b,state,pddls) + Math.abs(this.getPosition(b,state)-state.arm) 
                + (Math.abs(this.getPosition(a,state)-this.getPosition(b,state)-1))+2;//not working if both in the last stack?
            }

            if(this.countOnTop(b,state,pddls)>this.countOnTop(a,state,pddls)){

                count = this.countOnTop(b,state,pddls)*4 + Math.abs(this.getPosition(b,state)-state.arm) + (Math.abs(this.getPosition(a,state)
                -this.getPosition(b,state)+1))+2;//+2 is for picking up and dropping b 
            }
            else{
                //move A
                count = this.countOnTop(a,state,pddls)*4 + Math.abs(this.getPosition(a,state)-state.arm) + (Math.abs(this.getPosition(a,state)
                    -this.getPosition(b,state)+1))+2;
            }

        }
        else if(cond.rel == "leftof"){
            if(state.holding != null && this.equalObjects(state.objects[state.holding], ao) && this.getPosition(b,state) != 0){
                return Math.abs(this.getPosition(b,state)-state.arm-1); // currently not checking if stack next to b is full

            }
            else if(state.holding != null && this.equalObjects(state.objects[state.holding], bo)){
                if(this.amountOfTiles(a,state,pddls) == state.arm)
                    return 2+ this.countOnTop(a,state,pddls)*4 + Math.abs(this.getPosition(a,state)-state.arm)*2;
                return 1+ this.countOnTop(a,state,pddls)*4 + Math.abs(this.getPosition(a,state)-state.arm)*2;
            }

            if(this.getPosition(b,state) == 0){//not perfect
                count = this.countOnTop(a,state,pddls)*4 + this.countOnTop(b,state,pddls) + Math.abs(this.getPosition(b,state)-state.arm) 
                + (Math.abs(this.getPosition(a,state)-this.getPosition(b,state)-1))+2;
            }

            else if(this.countOnTop(b,state,pddls)>this.countOnTop(a,state,pddls)){

                count = this.countOnTop(a,state,pddls)*4 + Math.abs(this.getPosition(a,state)-state.arm) 
                + (Math.abs(this.getPosition(a,state)-this.getPosition(b,state)-1))+2;//+2 is for picking up and dropping b 
            }
            else{
                //move B
                count = this.countOnTop(b,state,pddls)*4 + Math.abs(this.getPosition(b,state)-state.arm) 
                + (Math.abs(this.getPosition(a,state)-this.getPosition(b,state)-1))+2;
            }

        }
        else if(cond.rel == "beside"){
            if(state.holding != null && this.equalObjects(state.objects[state.holding], ao)){
                return Math.abs(this.getPosition(b,state)-state.arm)-1; // currently not checking if stack next to b is full
            }
             else if(state.holding != null && this.equalObjects(state.objects[state.holding], bo)){
                return 1 + Math.abs(this.getPosition(a,state)-state.arm)-1;
            }
            if(this.countOnTop(b,state,pddls)>this.countOnTop(a,state,pddls)){

                count = this.countOnTop(b,state,pddls)*4 + Math.abs(this.getPosition(b,state)-state.arm) 
                + (Math.abs(this.getPosition(a,state)-this.getPosition(b,state))-1)+2;//+2 is for picking up and dropping b 
            }
            else{
                //move A
                count = this.countOnTop(a,state,pddls)*4 + Math.abs(this.getPosition(a,state)-state.arm)
                 + (Math.abs(this.getPosition(a,state)-this.getPosition(b,state))-1)+2;
            }
            // a on floor? #objects on top of b + #objects leftofA < rightofA

        }
        console.log("Path length: " + count);
        return count;

    }
    specialIndexOf(obj:number[]):number {    
        for (var i = 0; i < this._nodeValues.length; i++) {
            if (this._nodeValues[i][0] == obj[0] && this._nodeValues[i][1] == obj[1]) {
                return i;
            }
        }
        return -1;
    }
    reachedGoal(current: number, cond :  Interpreter.Literal[]):boolean{
      // var state = this._nodeValues[current];
        for(var i = 0; i < cond.length; i++ ){
            if( cond[i] != null && !this.checkGoal( current, cond[i]))
                return false;
            
        }
        return true;
    }

    checkGoal(current:number, goal:Interpreter.Literal):boolean {
        console.log("at checkgoal");
        var cond = goal;
        var state = this._nodeValues[current];
        var a = cond.args[0];
        var pddls = state.pddl.toArray();

        if(cond.rel == "hold"){
            console.log("this is it");
            if(state.holding && state.holding == a){
                return true;
            }
            return false;
        }
        var b = cond.args[1];

        if(cond.rel == "above"){
            for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[0];
                if(this.equalObjects(state.objects[x], state.objects[a])){
                    var y = pddl.args[1];
                    if(this.equalObjects(state.objects[y], state.objects[b]))
                        return true;
                    else if(state.objects[y].form == "floor") //hopefully this is the correct syntax
                        return false;
                    else{
                       a=x;
                       index =-1;
                    }
                }
            }
        }
        else if(cond.rel == "ontop" || cond.rel == "inside"){
            for(var index = 0; index < pddls.length; index++){
                 var pddl = pddls[index];
                 if(this.equalObjects(state.objects[pddl.args[0]], state.objects[a])){
                    if(this.equalObjects(state.objects[pddl.args[1]], state.objects[b]))
                        return true;
                    return false;
                 }
            }
        }
        else if(cond.rel == "under"){
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[0];
                if(this.equalObjects(state.objects[x], state.objects[b])){
                    var y = pddl.args[1];
                    if(this.equalObjects(state.objects[y],state.objects[a]))
                        return true;
                    else if(state.objects[y].form == "floor") 
                        return false;
                    else{
                       b=x;
                       index =-1;
                    }
                }
            }
            
        }
        else if(cond.rel == "beside"|| cond.rel == "rightof"|| cond.rel == "leftof"){
            if(cond.rel == "beside"|| cond.rel == "rightof"){
                //find floor (a is rightof b, so floor to left of floor and search upwards)
                var floor;
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[0];
                    if(x == a){
                        if(state.objects[pddl.args[1]].form == "floor")
                            floor = pddl.args[1];//found floor
                        else{
                           a=x;
                           index =-1;
                        }
                    }
                }
                var floor2;
                for(var indexFloor= 0; indexFloor < pddls.length; indexFloor++){
                    var pddl = pddls[indexFloor];
                    var x = pddl.args[0];
                    if(pddl.rel == "rightof" && this.equalObjects(state.objects[x],state.objects[floor])){
                        floor2 = pddl.args[1];
                    }
                    //found floor, now work up
                }
                for(var indexLeft = 0; indexLeft < pddls.length; indexLeft++){
                    var pddl = pddls[indexLeft];
                    var x = pddl.args[1];
                    if(this.equalObjects(state.objects[x],state.objects[floor2])){
                        if(this.equalObjects(state.objects[pddl.args[0]], state.objects[b]))
                            return true;
                        else{
                            floor2 = pddl.args[0];
                            indexLeft = -1;
                        }
                    }

                }

            }
            if(cond.rel == "beside"|| cond.rel == "leftof"){
                var floor;
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[0];
                    if(this.equalObjects(state.objects[x], state.objects[a])){//------------------
                        if(state.objects[pddl.args[1]].form == "floor")
                            floor = pddl.args[1];//found floor
                        else{
                           a=x;
                           index =-1;
                        }
                    }
                }
                var floor2;
                for(var indexFloor= 0; indexFloor < pddls.length; indexFloor++){
                    var pddl = pddls[indexFloor];
                    var x = pddl.args[0];
                    if(pddl.rel == "leftof" && this.equalObjects(state.objects[x],state.objects[floor])){
                        floor2 = pddl.args[1];
                    }
                    //found floor, now work up
                }
                for(var indexRight = 0; indexRight < pddls.length; indexRight++){
                    var pddl = pddls[indexRight];
                    var x = pddl.args[1];
                    if(this.equalObjects(state.objects[x],state.objects[floor2])){
                        if(this.equalObjects(state.objects[pddl.args[0]], state.objects[b]))
                            return true;
                        else{
                            floor2 = pddl.args[0];
                            indexRight = -1;
                        }
                    }

                }
            }
            return false;
            
        }
        return true;
    }
    
    getWorldWidth(state : WorldState):number{
    	var nFloors : number = 0;
	    var pddls = state.pddl.toArray();
	    for(var i = 0; i < pddls.length; i++){
	    	if(pddls[i].rel == "leftof" && state.objects[pddls[i].args[0]].form == "floor"){
	    		nFloors ++;
	    	}
	    }
	    // add one extra, just because number of leftofs is one less than nmbr floors.
	    if(nFloors > 0){
	    	nFloors ++;
	    }
	    return nFloors;
    }
    
    getFloorSize(state : WorldState):number{
	    var nFloors : number = 0;
	    do{
	        nFloors++;
	        var temp : Interpreter.Literal[] = state.pddl.toArray();
	        for(var i = 0; i < state.pddl.size(); i++){
	            var found : boolean = (temp[i].args[0]=="f" + nFloors);
	            if(found){
	                break;
	            }
	        }
	        
	     }while(!found)          
	    return nFloors;
	}
}





module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];

        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }


    export interface Result extends Interpreter.Result {plan:string[];}


    export function planToString(res : Result) : string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        
        console.log("armpos: "+state.arm + " , holding: " + state.holding);
        var shortest = null;//keeps track of shortest path encountered

        var sp = new Shortestpath(1);
        var as = new Astar<number[]>(sp);

        sp._nodeValues.push(state);//added this.. not sure if this is the place

        var result = null;
        var temp : number[];
        var tempNodevalues = [];
        
        var results = new collections.PriorityQueue<number[]>(
        					function (a : number[], b : number[]){
        						return b.length - a.length;
        					});
        for(var i = 0; i < intprt.length; i++){
            this._nodeValues = [];
            this._neighborValues = [];
            this._nodeValues.push(state);

            temp = as.star(0, intprt[i]);
            
            if(temp && temp.length > 0){
            	results.enqueue(temp);
            }
			
            if(result == null ||temp.length < result.length ){
                result = temp;      
                tempNodevalues = this._nodeValues;
            }

        }
        this._nodeValues = tempNodevalues;

        //sen execute:A den bästa planen (om det blev någon plan)
        var plan : string[] = [];
        if(!results.isEmpty()){
        	var path : number[]= results.dequeue();
        	for(var i = path.length-1; i >= 0 ; i--){ // travers backwards
        		plan.push(sp._nodeValues[ path[i] ].planAction);
        	}
        }
        

    /*    if(result != null){
            console.log("length of plan: " + tempNodevalues.length)
            for(var i = 0; i<this._nodeValues.length; i++ ){
                console.log("action planned: "+this._nodeValues[i].planAction);
                plan.push("p");//possible to check what kind of action and add text here
            }
        }
        else{
            //throw error
        }*/
        console.log("armpos2: "+state.arm + " , holding: " + state.holding);
        return plan;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    
}
