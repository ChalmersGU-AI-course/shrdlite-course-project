class Interpreter

    Interpreter.interpret = (parses, currentState) ->
        parseInterpList = []
        for parse in parses
            matchingObjEntities = getMatchingEntities(parse.prs.ent, currentState)
            if parse.prs.loc?
                matchingLocEntities = getMatchingEntities(parse.prs.loc.ent, currentState)
                for obj in matchingObjEntities
                    for locObj in matchingLocEntities
                        if obj isnt locObj
                            intrp = {
                                input: parse.input,
                                prs: parse.prs,
                                # TODO: placeholder for [[obj]], [[locObj]] lists of objects
                                #       quantifers set to "all"
                                intp: [{ pol: true, rel: parse.prs.loc.rel, args: [[obj], [locObj]], quantifier1: "all", quantifier2: "all"}]
                            }
                            parseInterpList.push(intrp)
            else
                for obj in matchingObjEntities
                    intrp = {
                            input: parse.input,
                            prs: parse.prs,
                            intp: [{ pol: true, rel: "holding", args: [obj]}]
                        }
                    parseInterpList.push(intrp)
        if parseInterpList.length is 0
            throw new Interpreter.Error 'Could not find any interpretations.'
        else    
            parseInterpList

    getMatchingEntities = (entity, currentState) ->
        if entity.obj.loc?
            retObjs = []
            objs = getMatchingObjects(entity.obj.obj, currentState)
            if objs.length is 0
                Error "No interpretation found."
            else
                objsOnLoc = getMatchingEntities(entity.obj.loc.ent, currentState)
                switch entity.obj.loc.rel
                    when "ontop","inside" then relFun = ((s, a, b) -> onTopCheck(s, a, b))
                    when "leftof" then relFun = ((s, a, b) -> leftOfCheck(s, a, b))
                    when "rightof" then relFun = ((s, a, b) -> leftOfCheck(s, b, a))
                    when "above" then relFun = ((s, a, b) -> aboveCheck(s, a, b))
                    when "under" then relFun = ((s, a, b) -> aboveCheck(s, b, a))
                    when "beside" then relFun = ((s, a, b) -> leftOfCheck(s, a, b) or leftOfCheck(s, b, a))
                for obj in objs
                    for locObj in objsOnLoc
                        if relFun(currentState, obj, locObj)
                            retObjs.push(obj)
            retObjs
        else
            getMatchingObjects(entity.obj, currentState) 

    getMatchingObjects = (object, currentState) ->    
        objs = []
        if object.form is "floor"
            objs.push "floor"
        else
            for k,stateObj of currentState.objects
                if object.size is null or object.size is stateObj.size
                    if object.color is null or object.color is stateObj.color
                        if object.form is null or object.form is "anyform" or object.form is stateObj.form
                            objs.push(k)
        objs

    Interpreter.interpretationToString = (res) ->
        res.intp.map((lits) ->
            literalToString lits
        ).join ' | '

    literalToString = (lit) ->
        (if lit.pol then '' else '-') + lit.rel + '(' + lit.args.join(',') + ')'

    Interpreter.Error = do ->
        `var Error`
        Error = (message) ->
            @message = message
            @name = 'Interpreter.Error'
            return

        Error::toString = ->
            @name + ': ' + @message

        Error
