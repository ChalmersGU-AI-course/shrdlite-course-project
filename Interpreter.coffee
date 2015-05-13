class Interpreter

    Interpreter.interpret = (parses, currentState) ->
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

    Interpreter.interpretationToString = (res) ->
        return "interpToString"

    Interpreter.literalToString = (lit) ->
        return "litToString"

    Interpreter.Error = () ->
        Error = (message) ->
            @message = message
            @name = 'Interpreter.Error'
            return

        Error::toString = ->
            @name + ': ' + @message

        Error
