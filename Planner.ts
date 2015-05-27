///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>

class Shortestpath implements Graph<number[]>{   // index 0 = x, index 1 = y
     _nodeValues : Array<WorldState>;
    _nodeneighbors : Array<Array<WorldState>>;   //neighboring nodes to index node 
    _edges : Array<Array<WorldState>>;        //from index node a to index node b
    _heuristicWeight : number;

    constructor(heuristic:number){
        this._heuristicWeight = heuristic;
        
        this._nodeValues = [];
        var index = 0;  
                index ++;  
        
    }

	cloneWorld(world :WorldState):WorldState{
		var newworld : WorldState = {
			"stacks": [[""]],
    		"pddl": this.cloneSet(world.pddl),
    		"holding": this.clone<string>(world.holding),
    		"arm": this.clone<number>(world.arm),
    		"planAction": this.clone<string>(world.planAction),
    		"description":"",
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
		var currentstate : WorldState = this._nodeValues[node];
		var neig :WorldState[] = [];
		// max 3 possible states
		// move arm left
		if(currentstate.arm > 0 ){
			var possiblestate : WorldState = this.cloneWorld(currentstate);
			// reduce arm poss
			possiblestate.arm -= 1;
			possiblestate.planAction = "l";
			neig.push(possiblestate);
		}
		// move arm right
		if(currentstate.arm < this.getWorldWidth(currentstate)-1 ){
			var possiblestate : WorldState = this.cloneWorld(currentstate);
			// increase arm poss
			possiblestate.arm += 1;
			possiblestate.planAction = "r";
			neig.push(possiblestate);
		}
		// pick up
		var topLit = Planner.getTopLiteral(currentstate, currentstate.arm);
		if((!currentstate.holding || currentstate.holding.length == 0)&& topLit 
				&& currentstate.planAction !="p"){	
			// if it is not holding anything and ther is something on the floor
			var possiblestate : WorldState = this.cloneWorld(currentstate);
			var topobj = this.getTopObj(currentstate, currentstate.pddl.toArray());
			// set the top obj as holding
			possiblestate.holding = topobj;
			// remove top literal
			possiblestate.pddl.remove(topLit);
			possiblestate.planAction = "p";
			// add info to description
			//var descObj = possiblestate.objects[topobj];
			possiblestate.description = this.getMinimumDescription(topobj, possiblestate); //" " + descObj.size + " " + descObj.color + " " + descObj.form;
			neig.push(possiblestate);
		}else if(currentstate.holding && currentstate.planAction !="d"){ // drop
			var possiblestate : WorldState = this.cloneWorld(currentstate);
			// get top obj
			var topobj :string;
			var relation : string = "ontop";
			if(topLit){
				topobj = topLit.args[0];
				// check if there is a box (ontop or inside relation)
				if(possiblestate.objects[topobj].form == "box"){
					relation = "inside";	
				}
			}else{
				topobj = "f" + currentstate.arm;
			}
			
			
			var newliteral = {pol: true, rel : relation, args : [possiblestate.holding, topobj]};
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
        
        return neigNumbers;
    }
    
    getMinimumDescription(obj : string, state : WorldState): string{
    	var descObj = state.objects[obj];
    	var minDesc : string[]= Interpreter.identifyObj(descObj.form, "", "", state);
    	if( minDesc.length == 1){// only form is nessicary
    		return " "+ descObj.form;
    	}
    	minDesc = Interpreter.identifyObj(descObj.form, descObj.color, "", state);
		if(minDesc.length == 1){	
    		return " " + descObj.color + " " + descObj.form;
		}
		minDesc = Interpreter.identifyObj(descObj.form, "", descObj.size, state);
		if(minDesc.length == 1){	
    		return " " + descObj.size + " " + descObj.form;
		}

    	return " " + descObj.size + " " + descObj.color + " " + descObj.form;
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
    	if(state1.pddl.size() != state2.pddl.size()){
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
    
    // Gets the object at the top of the column under the arm
    getTopObj(state:WorldState, pddls:Interpreter.Literal[]):string{
        var ind :number= -1;
        var obj = "f" + state.arm;
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            var x = pddl.args[1];
            if(pddl.args[1] != null && ((pddl.rel == "ontop" || pddl.rel == "inside")&& x == obj)){
                obj = pddl.args[0];
                ind=index;
                index = -1;
            }
        }
        return obj;
    }
    
    getTopRelation(pos : number ,state:WorldState):Interpreter.Literal{
        var z = "f" + pos;
        var pd;
        var pddls = state.pddl.toArray();
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            var x = pddl.args[1];
            if(pddl.args[0] == null){}
            else if((pddl.rel == "ontop" || pddl.rel == "inside") && x==z){
                z = pddl.args[0];
                index = -1;
                pd = pddl;
            }
        }
        return pd;
    }

    getTopObjInd(state:WorldState, pddls:Interpreter.Literal[]):number{
        var ind :number= -1;
        var fln = state.arm; 
        var z = "f" + fln.toString();
        for(var index = 0; index < pddls.length; index++){
            console.log("x: " + x + " , z: "+z);
            var pddl = pddls[index];
            var x = pddl.args[0];
            if(pddl.args[0] == null){}
            else if((pddl.rel == "ontop" || pddl.rel == "inside") && x==z){
                console.log("new vals :x: " + x + " , z: "+z);
                z = pddl.args[0];
                ind= index;
                index = -1;

            }
        }
        return ind;
    }


    getcost(from: number,to:number):number{
        return 1;
    }
    

    //counts objects on top of given object
    countOnTop(obj :string, state:WorldState, pddls:Interpreter.Literal[]):number{
        var lit = this.findObjLiteral(obj, state);
        // if obj is ontop then this is the top obj and no one is above
        if(!lit){
        	return 0;
        }
        if(lit.args[0] == obj){
        	return 0;
        }
        return this.countOnTopHelper(1, lit, pddls);
    }
    
    countOnTopHelper(counter : number, lit : Interpreter.Literal, lits : Interpreter.Literal[] ):number{
		var result : Interpreter.Literal;
		for(var j = 0; j < lits.length; j++){
			if(lits[j].args[1] == lit.args[0] && (lits[j].rel == "ontop" || lits[j].rel == "inside")){
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
            if(pddl.args[0]==x){
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
            if(pddl.rel == "rightof" &&  pddl.args[1]==floor){
                floor = pddl.args[0];
                index = -1;
                counter ++;
            }
        }
        return counter;
    }


    //returns x-pos (0->x) for object a
    findPosition_old(obj : string, state : WorldState, pddls : Interpreter.Literal[]):number{
		var x = obj;
		var position = 0;
		var floor : string = "f" + state.arm;

		//time to move leftwards along the floors
		for(var index = 0; index < pddls.length; index++){
		    var pddl = pddls[index];
		    // Find floor under which is under the arm
		    if(pddl.rel == "leftof" && pddl.args[1]== floor){
		        floor = pddl.args[0];
		        index = -1;
		        position ++;
		
		    }
		    if(floor == "f0"){
		        return position;
		    }
		}
		return position;//should never happen
    }
    
    findObjLiteralUnder(obj : string, state : WorldState): Interpreter.Literal{
    	var pddls = state.pddl.toArray();
    	for(var i = 0; i < pddls.length; i++){
    		// second try to find the litterl where obj is arg 0 
    		//(means that it is on the top or at the edge of the world if floor.)
    		if(pddls[i].args[0] == obj && (pddls[i].rel == "ontop" || pddls[i].rel == "inside")){
    			return pddls[i];
    		}
    	}
    	return null;
    }
    
    findObjLiteral(obj : string, state : WorldState): Interpreter.Literal{
    	var pddls = state.pddl.toArray();
    	for(var i = 0; i < pddls.length; i++){
    		// first try to find the litterl where obj is arg 1
    		if(pddls[i].args[1] == obj  && (pddls[i].rel == "ontop" || pddls[i].rel == "inside")){
    			return pddls[i];
    		}
    	}
    	for(var i = 0; i < pddls.length; i++){
    		// second try to find the litterl where obj is arg 0 
    		//(means that it is on the top or at the edge of the world if floor.)
    		if(pddls[i].args[0] == obj && (pddls[i].rel == "ontop" || pddls[i].rel == "inside")){
    			return pddls[i];
    		}
    	}
    	return null;
    }
    
    // returns the position in dimention X.
    getPosition(obj : string, state : WorldState): number{
    	var pddls = state.pddl.toArray();
    	var counter = 0;
    	if(state.holding == obj){
    		return state.arm;
    	}
    	if(state.objects[obj].form == "floor"){	// find the floor pos (special case)
    		for(var i = 0; i < this.getWorldWidth(state); i++){
    			if(obj == "f"+i){
    				return i;
    			}
    		}
    	}
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
    	if(!lit){
    		return false;
    	}
    	if(lit.args[0] == obj){
    		return true;
    	}
		for(var j = 0; j < lits.length; j++){
			if(lits[j].args[1] == lit.args[0] && (lits[j].rel == "ontop" || lits[j].rel == "inside")){
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
        if(a.form == b.form && a.color == b.color && a.size == b.size)
            return true;
        return false;
    }

    heuristic_cost_estimate(current:number, goal:Interpreter.Literal[]):number{
        var count = 0;
        var morethanone : boolean = goal.length > 1;
        for(var i = 0; i < goal.length; i++ ){
            if(goal[i] != null){
                count += this.heuristic_cost(current, goal[i], morethanone);
            }
        }
        count = count;
        return count;
    }

    heuristic_cost(current:number, goal:Interpreter.Literal, morethanone : boolean):number{//some parts can be improved
        if(this.checkGoal(current, goal)){
            return 0;
        }
        var cond = goal;
        var state = this._nodeValues[current]; 
        
        var pddls = state.pddl.toArray();
        var count = 0;
        var samePile:boolean = false;
        
        var a = cond.args[0];
        var posA = this.getPosition(a,state);
    	var ontopA = this.countOnTop(a,state,pddls);
        
        if(cond.rel == "hold"){
            if(state.holding != null){
                if(state.holding == a){
                    return 0;
                }
                else{
                    return ontopA*4 + Math.abs(posA-state.arm-1) +1;//should maybe be +2..
                }
            }
            else{
                return ontopA + Math.abs(posA-state.arm);
            }
        }
		var b = cond.args[1];
		var posB = this.getPosition(b,state);
		var ontopB = this.countOnTop(b,state,pddls);
		
        if(cond.rel == "ontop" || cond.rel == "inside"){

            //if a above b, take #objects on b * 4 + (ifnotinsamepile)#objects on a*4 + distancefromcrane to a + distancefromatob
            
            if(state.holding == a && ontopB == 0){// if we are holding the objective
                return 1 + Math.abs(posB - state.arm);
            }
            else if(state.holding == b){// if we are holding the wrong objective
            	count += (ontopA-1)*4 + Math.abs(posA-state.arm) + 3;
            	if(this.getTopRelation(state.arm, state) && this.checkLegalLit(b, this.getTopRelation(state.arm,state).args[0], state)){
            		count += 1;
            	}else if(!morethanone){
            		count += this.costToClosestLegalNewPos(b, a, state.arm, state);
            	}
            	
                return count; 
            }
            // if anything is ontop of b, then count object on top and predict cost for placeing the top obj at another spot
            
            if(ontopB > 0){
            	count += (ontopB-1)*4 + Math.abs(posB-state.arm);
            	// find shortest path to a possition to place the obj at the top
            	var ontopColB = this.getTopRelation(posB , state);
            	if(!morethanone){
	            	count += this.costToClosestLegalNewPos(ontopColB.args[0], a, posB, state);
	            }else{
	            	count += 4;
	            }
            	if(posA == posB){
            		//count += 4;	// if they are in same column, then we have to move away an then back again min 4.
            	}
            	
            }else{
            	count += 1; // for droping a on b
            }
            // if anything is ontop of a, then count object on top and predict cost for placeing the top obj at another spot
            if(ontopA > 0 && posA != posB){ 	// we dont need to go here if they are in the same column
            	count += (ontopA-1)*4 +Math.abs(posA-state.arm);
            	// find shortest path to a possition to place the obj at the top
            	var ontopColA = this.getTopRelation(posA , state);
            	if(!morethanone){
            		count += this.costToClosestLegalNewPos(ontopColA.args[0], b, posA, state);
            	}else{
	            	count += 4;
	            }
            }else{
            	count += Math.abs(posA-state.arm) + 1;	// +1 for picking it up
            }
            if(state.holding ){
            	count += 1; //if holding then +1 to drop it 
            }
            return count; 

        }
        else if(cond.rel == "above"){
            if(state.holding != null && state.holding == a){
                return 1 + Math.abs(posB - state.arm);
            }
            else if(state.holding != null && state.holding== b){
                return 1+ ontopA*4 + Math.abs(posA-state.arm)*2;
            }
            if(posA == posB && ontopB > ontopA)//check if completed
                return 0;
            var z = a;
            //traverse up through a;
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[1];
                if(x==z){
                    if( pddl.args[0]== b)
                        samePile = true;
                    else{
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    }
                }
            }
            count = count*4;
            if(posA == posB){
                count += 3 + Math.abs(posB - state.arm);
            }else{
                count += Math.abs(posA-state.arm) + Math.abs(posA-posB);
            }

            return count;
        }
        else if(cond.rel == "under"){
        	
        	// check number of objs above b 
        	count += (this.countOnTop(b, state, state.pddl.toArray()) * 4);
        	// add them
        	// check arm distance to b and add to count
        	var armdist = Math.abs(state.arm - posB);
        	count += armdist;
        	if(armdist == 0 && !state.holding ){
        		count ++;
        	}else if(armdist == 0 && state.holding != b){
        		count += 2;	//move and drop the object
        	}else if(!state.holding){
        		count ++;
        	}
        	// check number of steps left/right from b to a column
        	var objdist = Math.abs(posA - posB);
        	if(objdist == 0 && state.holding == b){
        		count ++;
        	}else if(objdist == 0 && state.holding == a){
        		count += 6;
        	}
        	count += objdist;
            return count;
        } 
        else if(cond.rel == "rightof"){//currently not handling if B is in holding

            if(state.holding != null && state.holding== a && posB != this.amountOfTiles(b,state,pddls)){
                return Math.abs(posB-state.arm+1); // currently not checking if stack next to b is full

            }
            else if(state.holding != null && state.holding== b){
                return 1+ ontopA*4 + Math.abs(posA-state.arm)*2;
            }

            if(posB == this.amountOfTiles(b,state,pddls)){//not perfect
                count = ontopA*4 + ontopB + Math.abs(posB-state.arm) 
                + (Math.abs(posA-posB-1))+2;//not working if both in the last stack?
            }

            if(ontopB>ontopA){

                count = ontopB*4 + Math.abs(ontopB-state.arm) + (Math.abs(posA-posB+1))+2;//+2 is for picking up and dropping b 
            }
            else{
                //move A
                count = ontopA*4 + Math.abs(posA-state.arm) + (Math.abs(posA-posB+1))+2;
            }

        }
        else if(cond.rel == "leftof"){
            if(state.holding != null && state.holding== a && posB != 0){
                return Math.abs(posB-state.arm-1); // currently not checking if stack next to b is full

            }
            else if(state.holding != null && state.holding== b){
                if(this.amountOfTiles(a,state,pddls) == state.arm)
                    return 2+ ontopA*4 + Math.abs(posA-state.arm)*2;
                return 1+ ontopA*4 + Math.abs(posA-state.arm)*2;
            }

            if(this.getPosition(b,state) == 0){//not perfect
                count = ontopA*4 + ontopB + Math.abs(posB-state.arm) 
                + (Math.abs(posA-posB-1))+2;
            }

            else if(ontopB>ontopA){

                count = ontopA*4 + Math.abs(posA-state.arm) 
                + (Math.abs(posA-posB-1))+2;//+2 is for picking up and dropping b 
            }
            else{
                //move B
                count = ontopB*4 + Math.abs(posB-state.arm) 
                + (Math.abs(posA-posB-1))+2;
            }

        }
        else if(cond.rel == "beside"){
        	// if holding then 
            if(state.holding== a){
            	var dist = Math.abs(posB-state.arm);
            	if(dist == 0){
            		dist ++;
            	}
            	if(posA == posB){
            		dist = 2; 
            	}
                return dist; // currently not checking if stack next to b is full
            }
            else if(state.holding== b){
             	var dist = Math.abs(posA-state.arm);
            	if(dist == 0){
            		dist ++;
            	}
            	if(posA == posB){
            		dist = 2; 
            	}
                return dist;
            }
            if(ontopB == ontopA){
            	var test1 = ontopB*4 + Math.abs(posB-state.arm) 
                + (Math.abs(posA-posB)-1)+2;
                var test2 = ontopA * 4 + Math.abs(posA-state.arm)
                 + (Math.abs(posA-posB)-1)+2;
                 count = test1;
                 if(test1 > test2){
                 	count = test2;
                 }
            }else
            if(ontopB > ontopA){

                count = ontopB*4 + Math.abs(posB-state.arm) 
                + (Math.abs(posA-posB)-1)+2;//+2 is for picking up and dropping b 
            }
            else{
                //move A
                count = ontopA * 4 + Math.abs(posA-state.arm)
                 + (Math.abs(posA-posB)-1)+2;
            }
            // a on floor? #objects on top of b + #objects leftofA < rightofA

        }
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
        for(var i = 0; i < cond.length; i++ ){
            if( cond[i] != null && !this.checkGoal( current, cond[i]))
                return false;
            
        }
        return true;
    }
    
    costToClosestLegalNewPos(obj : string, exptobj : string, pos : number, state : WorldState): number{
    	var bsfcount = 100000;
    	var worldwidth : number= this.getWorldWidth(state);
    	var newlit : Interpreter.Literal;
    	for(var k = 1; k >= -1;){		// check first to the right + , then to the left -
	    	for(var i = pos + k; i < worldwidth && i > 0; i += k){
	    		var count = Math.abs(pos - i) +2; // for each step add 1 to counter
	    		
	    		newlit = this.getTopRelation( i, state);
	    		var newpos = "f"+i;
	    		if(newlit){
	    			newpos = newlit.args[0];
	    		}
	    		var found = false
	    		while(newpos != "f"+i && ! found){
	    			if(this.checkLegalLit(obj, newpos, state) && newpos != exptobj){	// check one step right
		    			found = true;
		    		}
		    		// for each object ontop a possible new position add alteast 4 to counter
		    		newlit = this.findObjLiteralUnder(newlit.args[1], state);	// go down one step in column
		    		if(!newlit){	// no obj under
		    			found = true;
		    		}else{
		    			count += 4;
		    			newpos = newlit.args[1];
		    		}
		    		
	    		}
	    		if(count < bsfcount){
	    			bsfcount = count;
	    		}
	    	}
	    	k -= 2;
	    }

    	return bsfcount;
    }
    
    checkLegalLit(obja : string, objb : string, state : WorldState):boolean{
    	var relation : string = "ontop";
		// check if there is a box (ontop or inside relation)
		if(state.objects[obja].form == "box"){
			relation = "inside";	
		}
		var templiteral = {pol: true, rel : relation, args : [obja, objb]};
		if(Interpreter.checkIllegal(templiteral, state)){
			return true;
		}
		return false;
    }

    checkGoal(current:number, goal:Interpreter.Literal):boolean {
        var cond = goal;
        var state = this._nodeValues[current];
        var a = cond.args[0];
        var pddls = state.pddl.toArray();

        if(cond.rel == "hold"){
            if( state.holding == a){
                return true;
            }
            return false;
        }
        var b = cond.args[1];

        if(cond.rel == "above"){
        	var litb = this.findObjLiteral(b, state);
        	var under = this.containsObj(a, litb, state.pddl.toArray());
        	if(under){
        		return true;
        	}
        	return false
        }
        else if(cond.rel == "ontop" || cond.rel == "inside"){
            for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                if(pddl.args[0]== a && pddl.args[1]== b){
	                return true;
                }
            }return false;
        }
        else if(cond.rel == "under"){
        	var lita = this.findObjLiteral(a, state);
        	
        	var under = this.containsObj(b, lita, state.pddl.toArray());
        	if(under){
        		return true;
        	}
        	return false
        }
        else if(cond.rel == "beside" && !state.holding){
        	var pos1 = this.getPosition(a, state);
        	var pos2 = this.getPosition(b, state);
        	
        	if(pos1 == pos2 +1 || pos1 == pos2 -1){
        		return true;	
        	}
        	return false;
        }
        else if(( cond.rel == "rightof"|| cond.rel == "leftof") && !state.holding){
        	var pos1 = this.getPosition(a, state);
	        var pos2 = this.getPosition(b, state);
            if( cond.rel == "rightof" && pos1 > pos2 ){
	        	return true;	
            }
            if( cond.rel == "leftof" && pos1 < pos2){
               return true;
            }
            return false;
            
        }
        return false;
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
            plan.plan = planInterpretation(plan.intp, currentState);;
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }


    export interface Result extends Interpreter.Result {plan:string[]; currentstate:WorldState;}


    export function planToString(res : Result) : string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }
    
        // gets the top literal in a column, null if no object is in the column
    export function getTopLiteral(state : WorldState, armposs : number): Interpreter.Literal{
    	var pddls = state.pddl.toArray();
    	var result : Interpreter.Literal;
    	// Finde floor possition and the one ontop
    	for(var i = 0; i < pddls.length; i++){
    		if(pddls[i].args[1]=="f"+armposs && (pddls[i].rel == "ontop" ||  pddls[i].rel == "inside")){
    			result = this.findTopLiteral(pddls[i], pddls);
    			break;
    		}
    	}
    	return result;
    }
    
    // recursive function to follow a literal to find the one on the top
    export function findTopLiteral(lit : Interpreter.Literal, lits : Interpreter.Literal[] ): Interpreter.Literal{
		var result : Interpreter.Literal;
		for(var j = 0; j < lits.length; j++){
			if(lits[j].args[1] == lit.args[0] && (lits[j].rel == "ontop" || lits[j].rel == "inside")){
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


    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        
        var shortest = null;//keeps track of shortest path encountered

        var temp : number[];
        var tempNodevalues = [];
        var sp1 : Shortestpath = new Shortestpath(1);
        sp1._nodeValues.push(state);
        var results = new collections.PriorityQueue<number[]>(
        					function (a : number[], b : number[]){
        						return b.length - a.length;
        					});
        var morethanone : boolean = intprt[0].length > 1;
        // sort intprt after the heuristic cost for the literals
        var sortedIntrpt = new collections.PriorityQueue<Interpreter.Literal[]>(
        					function (a : Interpreter.Literal[], b : Interpreter.Literal[]){
        						var costA = 0;
        						
        						for(var i = 0; i < a.length; i++){
        							costA += sp1.heuristic_cost(0,a[i], morethanone);
        						}
        						var costB = 0;
        						for(var i = 0; i < b.length; i++){
        							costB += sp1.heuristic_cost(0,b[i], morethanone);
        						}
        						return costB - costA;
        					});
        for(var i = 0; i < intprt.length; i++){
        	morethanone = intprt[i].length > 1;
        	var debugcost = 0;
        	var debugprint = "";
        	for(var k = 0; k < intprt[i].length; k++){
        		debugprint += intprt[i][k].args.toString() + " ";
        		debugcost += sp1.heuristic_cost(0,intprt[i][k],morethanone);
        	}
        	console.log("Lit: " + debugprint + " cost: " + debugcost);
        	sortedIntrpt.enqueue(intprt[i]);
        }
        
        while(!sortedIntrpt.isEmpty()){
            var sp = new Shortestpath(1);
            var as = new Astar<number[]>(sp);
            sp._nodeValues.push(state);
			var bestsofar = results.peek();
			var bestsofarlength = 100000;;
			if(bestsofar){
				bestsofarlength = bestsofar.length;
			}
			
            temp = as.star(0, sortedIntrpt.dequeue(), bestsofarlength);
            
            if(temp && temp.length > 0 && temp.length <= bestsofarlength){
            	results.enqueue(temp);
            	tempNodevalues = sp._nodeValues;
            	sp1= sp;
            }
        }
        this._nodeValues = tempNodevalues;

        //sen execute:A den bästa planen (om det blev någon plan)
        var plan : string[] = [];
        if(!results.isEmpty()){
        	var path : number[]= results.dequeue();
        	var pa : string ;
        	var descCounter = 0;
        	var descStr : string;
        	var descStrs = getAllDescriptions(sp1._nodeValues, path);
        	var istake = isTake(sp1._nodeValues, path);
        	for(var i = path.length-1; i >= 0 ; i--){ // travers backwards
        		pa = sp1._nodeValues[ path[i] ].planAction;
        		descStr = sp1._nodeValues[ path[i] ].description;
        		if(descStr.length > 0){
        			descStr = editDescription(descStr, descCounter, descStrs.length-1, istake);
        			plan.push(descStr);
        			descCounter++;
        		}
        		plan.push(pa);
        	}
        }

        return plan;
    }
    
    function isTake(states :WorldState[], path : number[]):boolean{
    	var foundfirst : string = "";
    	for(var i = 0; i < path.length; i++){
    		if(states[path[i]].planAction == "p" || states[path[i]].planAction == "d"){
    			foundfirst = states[path[i]].planAction;
    			break;
    		}
    	}
    	if(foundfirst == "p"){
    		return true;
    	}
    	return false;
    }
    
    function getAllDescriptions(states :WorldState[], path : number[]):string[]{
    	var descs : string[] = [];
    	for(var i = 0; i < path.length; i++){
    		if(states[path[i]].description.length > 0){
    			descs.push(states[i].description);
    		}
    	}
    	return descs;
    }
    
    function editDescription(descStr : string, count : number, max : number, take : boolean):string{
    	if(count == 0){
    		descStr = "First I move the" + descStr;
    	}else if(count == max){
    		if(take){
    			descStr = "Picking up the" + descStr;
    		}else{
    			descStr = "Finally I move the" + descStr + "! :)";
    		}	
    	}else if(count == 1){
    		descStr = "Then I move the" + descStr;
    	}else{
    		descStr = "Moving the" + descStr;
    	}
    	
    	return descStr;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    
}
