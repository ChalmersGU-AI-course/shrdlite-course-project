class Interpreter

    Interpreter.interpret = (parses, currentState) ->
      interpList = []
      usedParses = []
      for parse in parses
        parseInterpList = getInterpListFromParse(parse, currentState)
        if parseInterpList.length > 0
            interpList.push(parseInterpList)
            usedParses.push(parse)
      
      parseInterps = []
      usedParse = null
      if interpList.length is 0
          throw new Interpreter.Error 'Could not find any interpretations.'
      else if interpList.length is 1
          parseInterps = interpList[0]
          usedParse = usedParses[0]
      else
          parseIndex = getParseClarification(usedParses)
          parseInterps = interpList[parseIndex]
          usedParse = usedParses[parseIndex]
      if parseInterps.length is 1
          return parseInterps
      else
          console.log "THE CHECK"
          parseInterps = getInterpListFromParse(usedParse, currentState, true)
          #for pInterp,i in parseInterps
          #  console.log "Inter" + i
          #  console.log pInterp
          #if entity.quant is "the" and retObjs.length > 1
          #[getObjClarification(retObjs, currentState)]
          return parseInterps

          
    getInterpListFromParse = (parse, currentState, quantifierCheck = false) ->
        parseInterpList = []
        matchingObjEntities = getMatchingEntities(parse.prs.ent, currentState, quantifierCheck)
        if parse.prs.loc?
            matchingLocEntities = getMatchingEntities(parse.prs.loc.ent, currentState, quantifierCheck)
            for obj in matchingObjEntities
                for locObj in matchingLocEntities
                    if objRelValid(obj, locObj, parse.prs.loc.rel, currentState)
                        intrp = {
                            input: parse.input,
                            prs: parse.prs,
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
        parseInterpList        

    
    # Simple check if the interpretation is possible
    objRelValid = (obj, locObj, rel, state) ->
        if obj is locObj
            return false
        if (rel is "ontop" or rel is "inside") and locObj isnt "floor"
            # We use getItem to go from letter to actual object
            o1 = getItem(state, obj)
            o2 = getItem(state, locObj)
            return isObjectDropValid(o1, o2)
        true

    # Prints the objects and asks which one
    getObjClarification = (objs, currentState) ->
        console.log "Did you mean: "
        for obj, i in objs
            objString = ""
            for k,currObj of currentState.objects
                if obj is k 
                    console.log i + ") The " + currObj.size + " " + currObj.color + " " + currObj.form
        objs[getClarificationAnswer(objs.length)]

    # Prints the parses and asks which one, returns the number
    getParseClarification = (parses) ->
        console.log "Did you mean: "
        for parse, i in parses
            prs = parse.prs
            entString = getEntString(prs.ent)
            locString = getLocString(prs.loc)
            locEntString = getEntString(prs.loc.ent)
            console.log i + ") " + entString + locString + locEntString
        getClarificationAnswer(parses.length)

    # Prompts the user for a number in the range and returns it
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

    # Creates a string from an entity
    getEntString = (entity) ->
        entString = entity.quant + " "
        if entity.obj.loc? # If the entity has an loc than it should be referred to
            entString = entString + getObjString(entity.obj.obj) + "that is "
            entString = entString + getLocString(entity.obj.loc)
            entString = entString + getEntString(entity.obj.loc.ent)
        else
            entString = entString + getObjString(entity.obj)

    # Creates a string from an object
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

    # Creates a string for the loc
    getLocString = (loc) ->
        switch loc.rel
            when "inside" then "in "
            when "ontop" then "on "
            when "leftof" then "left of "
            when "rightof" then "right of "
            else loc.rel + " "

    # Returns the entities that matches the description
    getMatchingEntities = (entity, currentState,quantifierCheck = false) ->
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
        if quantifierCheck and entity.quant is "the" and retObjs.length > 1
            [getObjClarification(retObjs, currentState)]
        else
            retObjs
    # Returns the objects that match the description
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
    
    # Returns a string for the interpretation
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
