

function uniqueAttributes ( w : WorldState  ) : { [s:string]: [string]}
{
	var objs : string[] = [];
	
	for(var oi in w.stacks)
	{
		var o : string[] = w.stacks[o];
		
		for(var oi' in o)
		{
			var o' : string = o[oi'];
			objs.push(o');
		}
	}
	
	
	var objsDef : [ObjectDefinition] = [];
	
	for(var obji in objs)
	{
		var objS : string = objs[obji];
		objsDef.push(w.objects[objS]);
	}
	
	
	var objsAttr : { [s:string]: [string]} = {} //Map of the least needed attributes.
	
	for(var obi in objs)
	{
		var obStr : string = objs[obi];
		var obDef : ObjectDefinition = w.objects[objStr];
		var obAttr : [string] = uniqueAttributes'(obDef, objsDef);
		
		objsAttr[obStr] = obAttr;
	}
	
	return objsAttr;
}

function uniqueAttributes' ( o : ObjectDefinition , os : [ObjectDefinition] ) : [string]
{
	var unqAttr : [string] = {oA.form};
	
	var unqOs : [ObjectDefinition] = uniqueAttributes'' ("form", oA.form, os);
	
	if(unqOs.length > 0)
	{
		var temp0 : [ObjectDefinition] = uniqueAttributes'' ("size", oA.size, unqOs);
		var temp1 : [ObjectDefinition] = uniqueAttributes'' ("color", oA.color, unqOs);
		
		if(temp0.length < temp1.length)
		{
			unqOs = temp0;
			if(unqOs <= 0)
			{
				unqAttr.push(oA.size);
			}
			else
			{
				unqAttr.push(oA.color);
				unqAttr.push(oA.size);
				if((uniqueAttributes'' ("color", oA.color, unqOs)).length > 0)
				{
					unqAttr.push("notUnique");
				}
			}
		}
		else
		{
			unqOs = temp1;
			if(unqOs <= 0)
			{
				unqAttr.push(oA.color);
			}
			else
			{
				unqAttr.push(oA.color);
				unqAttr.push(oA.size);
				if((uniqueAttributes'' ("size", oA.size, unqOs)).length > 0)
				{
					unqAttr.push("notUnique");
				}
			}
		}
	}
	
	return unqAttr;
}

function uniqueAttributes'' ( type : string , oA : string , os : [ObjectDefinition] ) : [ObjectDefinition]
{
	var notUnique : [ObjectDefinition];
	
	for(var i in os)
	{
		switch (type)
		{
			case "form":
				if(oA === os[i].form)
				{
					notUnique.push(os[i]);
				}
				break;
			case "size":
				if(oA === os[i].size)
				{
					notUnique.push(os[i]);
				}
				break;
			case "color":
				if(oA === os[i].color)
				{
					notUnique.push(os[i]);
				}
				break;
		}
	}
	return notUnique;
}
