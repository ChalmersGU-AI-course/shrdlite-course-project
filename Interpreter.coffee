class Interpreter

    Interpreter.interpret = (parses, currentState) ->
        console.log "-------Interpreter-------"
        console.log parses
        console.log parses[0].prs.ent
        console.log parses[0].prs.loc
        console.log "---"
        console.log parses[1].prs.ent
        console.log parses[1].prs.loc
        console.log "-------End-------"
        parseInterpList = []
        for parse in parses
            console.log "-----parse----"
            matchingObjEntities = getMatchingEntities(parse.prs.ent, currentState)
            matchingLocEntities = getMatchingEntities(parse.prs.loc.ent, currentState)
            console.log matchingObjEntities
            console.log matchingLocEntities
            for obj in matchingObjEntities
                for locObj in matchingLocEntities
                    intrp = {
                        input: parse.input,
                        prs: parse.prs,
                        intp: [{ pol: true, rel: parse.prs.loc.rel, args: [obj, locObj]}]
                    }
                    parseInterpList.push(intrp)
            console.log "----endparse-----"
        console.log parseInterpList
        parseInterpList
        ###
            intrp = { 
                input: 'move the bug to the bug catcher',
                prs: {
                    cmd: 'move',
                    ent: { 
                        quant: 'the',
                        obj: [Object]
                    },
                    loc: { 
                        rel: 'ontop',
                        ent: [Object]
                    }
                },
                intp: [ { pol: true, rel: 'ontop', args: [ 'm', 'floor' ] },
                        { pol: true, rel: 'holding', args: [ 'e' ] } ]
                }
            interpretations = []
            interpretations.push intrp
            interpretations.push intrp
            interpretations
        ###
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
                        console.log "---pair----"
                        console.log obj
                        console.log locObj
                        console.log "---endair----"
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
                        if object.form is null or object.form is stateObj.form
                            objs.push(k)
        objs

    Interpreter.interpretationToString = (res) ->
        res.intp.map((lits) ->
            literalToString lits
        ).join ' | '

    literalToString = (lit) ->
        (if lit.pol then '' else '-') + lit.rel + '(' + lit.args.join(',') + ')'

    Interpreter.Error = () ->
        Error = (message) ->
            @message = message
            @name = 'Interpreter.Error'
            return

        Error::toString = ->
            @name + ': ' + @message

        Error
