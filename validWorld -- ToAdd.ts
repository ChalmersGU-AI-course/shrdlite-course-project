function validWorld(topObject: string, bottomObject: string, objects: {[s:string]: ObjectDefinition}) : boolean {
	
	var allObjs = objects.length;
	
	//balls should be in boxes or on the floor
	if(objects[topObject].form == "ball" && objects[bottomObject].form != "box" || (bottomObject == null && objects[topObject].form == "ball")) {
		return false;
	}
	
	//Balls can't support anything
	if ((objects[bottomObject].form == "ball" && topObject != "") || ) {
		return false
	}
	
	//Small objects can't support large objects
	if(objects[bottomObject].size == "small" && objects[topObject].size == "large") {
		return false;
	}
	
	// Boxes cannot contain pyramids, planks or boxes of the same size.
	if(objects[bottomObject].form == "box" && (objects[topObject].form == "pyramid" || objects[topObject].form == "plank" || objects[topObject].form == "box") && objects[bottomObject].size == objects[topObject].size) {
		return false;
	}
	
	//Small boxes cannot be supported by small bricks or pyramids.
	if(objects[bottomObject].form == "brick" || objects[bottomObject].form == "pyramid" && objects[topObject].form == "box" && objects[topObject].size == "small"){
		return false;
	}
	
	//Large boxes cannot be supported by large pyramids.
	if(objects[bottomObject].form == "pyramid" && objects[bottomObject].small == "large" && objects[topObject].form == "box" && objects[topObject].size == "large") {
		return false
	}
	
	return true;
	
}