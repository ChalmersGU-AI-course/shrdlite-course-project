///<reference path="Interpreter.ts"/>
///<reference path="./Parser.ts"/>

/**
Takes a parse of the question type, i.e. parse.command === "Q: _____ "
Implemented questions:
  Where is __(entity)__ ? || Where are __(entity)__?
  How many __(plural object)__ are there?
  ....
  @param parse The question to answer
  @returns a string which gets printed to the User
*/
function interpretQuestion( parse : Parser.Command) : string{
  if(parse.command === "Q_where_is"){

  }
  if(parse.command === "Q_how_many"){

  }
  return "BAJS"
}
