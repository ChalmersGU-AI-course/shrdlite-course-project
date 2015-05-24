class Interpreter

    Interpreter.interpret = (parses, currentState) ->
      # If there are more than 1 parse than do a clarify 
      if parses.length > 1
            parse = getParseClarification(parses)
        else # Else just pick the one
            parse = parses[0]

        parseInterpList = []
        console.log parse
        matchingObjEntities = getMatchingEntities(parse.prs.ent, currentState)
        if parse.prs.loc?
            matchingLocEntities = getMatchingEntities(parse.prs.loc.ent, currentState)
            for obj in matchingObjEntities
                for locObj in matchingLocEntities
                    # A simple check to remove some impossible scenarios
                    if objRelValid(obj, locObj, parse.prs.loc.rel, currentState)
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

    objRelValid = (obj, locObj, rel, state) ->
        if obj is locObj
            return false
        if (rel is "ontop" or rel is "inside") and locObj isnt "floor"
            # We need to use getItem to get information about the objects
            o1 = getItem(state, obj)
            o2 = getItem(state, locObj)
            return isObjectDropValid(o1, o2)
        true
    
    getObjClarification = (objs, currentState) ->
        console.log "Did you mean: "
        for obj, i in objs
            objString = ""
            for k,currObj of currentState.objects
                if obj is k 
                    console.log i + ") The " + currObj.size + " " + currObj.color + " " + currObj.form
        objs[getClarificationAnswer(objs.length)]

    getParseClarification = (parses) ->
        console.log "Did you mean: "
        for parse, i in parses
            prs = parse.prs
            entString = getEntString(prs.ent)
            locString = getLocString(prs.loc)
            locEntString = getEntString(prs.loc.ent)
            console.log i + ") " + entString + locString + locEntString
        parses[getClarificationAnswer(parses.length)]
        
    getClarificationAnswer = (listLength) ->
        input = -1 # The input to be read
        fs = require 'fs'
        buf = new Buffer( 256 )
        # Windows and Linux/OS X reads the prompt differently
        if process.platform is "win32"
            input  = fs.readSync(process.stdin.fd, buf, 0, 256)
        else
            fd = fs.openSync("/dev/stdin", "rs")
            input = fs.readSync(fd, buf, 0, 256)
        ans = parseInt(buf.toString(null, 0, input), 10) # Try to parse the input as a number
        # If it is a number between 0 and length
        if not isNaN(ans) and 0 <= ans and ans < listLength
          return ans
        else # Repeat until a valid number is given
          console.log "You must input a number int the range 0.." + (listLength-1)
          return getClarificationAnswer listLength

    getEntString = (entity) ->
        entString = entity.quant + " "
        if entity.obj.loc?
            entString = entString + getObjString(entity.obj.obj) + "that is "
            entString = entString + getLocString(entity.obj.loc)
            entString = entString + getEntString(entity.obj.loc.ent)
        else
            entString = entString + getObjString(entity.obj)

    getObjString = (obj) ->
        objString = ""
        if obj.size?
            objString = objString + obj.size + " "
        if obj.color?
            objString = objString + obj.color + " "
        if obj.form is "anyform"
            objString = objString + "object "
        else
            objString = objString + obj.form + " "
        objString

    getLocString = (loc) ->
        switch loc.rel
            when "inside" then "in "
            when "ontop" then "on "
            when "leftof" then "left of "
            when "rightof" then "right of "
            else loc.rel + " "

    getMatchingEntities = (entity, currentState) ->
        retObjs = []  

        if entity.obj.loc?
            objs = getMatchingObjects(entity.obj.obj, currentState)
            if objs.length is 0
                Error "No matching entity found."
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
            retObjs = getMatchingObjects(entity.obj, currentState)
        if entity.quant is "the" and retObjs.length > 1
            [getObjClarification(retObjs, currentState)]
        else
            retObjs

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
