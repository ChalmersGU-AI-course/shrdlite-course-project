///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Planner.ts"/>

module Shrdlite {

    export function interactive(world : World) : void {
        function endlessLoop(utterance : string = "") : void {
            var inputPrompt = "What can I do for you today? ";
            var nextInput = () => world.readUserInput(inputPrompt, endlessLoop);
            if (utterance.trim()) {
                var plan : string[] = splitStringIntoPlan(utterance);
                if (!plan) {
                    plan = parseUtteranceIntoPlan(world, utterance);
                }
                if (plan) {
                    world.printDebugInfo("Plan: " + plan.join(", "));
                    world.performPlan(plan, nextInput);
                    return;
                }
            }
            nextInput();
        }
        world.printWorld(endlessLoop);
    }


    /**
     * Generic function that takes an utterance and returns a plan. It works according to the following pipeline:
     * - first it parses the utterance (Parser.ts)
     * - then it interprets the parse(s) (Interpreter.ts)
     * - then it creates plan(s) for the interpretation(s) (Planner.ts)
     *
     * Each of the modules Parser.ts, Interpreter.ts and Planner.ts
     * defines its own version of interface Result, which in the case
     * of Interpreter.ts and Planner.ts extends the Result interface
     * from the previous module in the pipeline. In essence, starting
     * from ParseResult, each module that it passes through adds its
     * own result to this structure, since each Result is fed
     * (directly or indirectly) into the next module.
     *
     * There are two sources of ambiguity: a parse might have several
     * possible interpretations, and there might be more than one plan
     * for each interpretation. In the code there are placeholders
     * that you can fill in to decide what to do in each case.
     *
     * @param world The current world.
     * @param utterance The string that represents the command.
     * @returns A plan in the form of a stack of strings, where each element is either a robot action, like "p" (for pick up) or "r" (for going right), or a system utterance in English that describes what the robot is doing.
     */
    export function parseUtteranceIntoPlan(world : World, utterance : string) : string[] {
        // Parsing
        world.printDebugInfo('Parsing utterance: "' + utterance + '"');
        try {
            var parses : Parser.ParseResult[] = Parser.parse(utterance);
            world.printDebugInfo("Found " + parses.length + " parses");
            parses.forEach((result, n) => {
                world.printDebugInfo("  (" + n + ") " + Parser.stringify(result));
            });
        }
        catch(err) {
            world.printError("Parsing error", err);
            return;
        }

        // Interpretation
        try {
            var interpretations : Interpreter.InterpretationResult[] = Interpreter.interpret(parses, world.currentState);
            world.printDebugInfo("Found " + interpretations.length + " interpretations");
            interpretations.forEach((result, n) => {
                world.printDebugInfo("  (" + n + ") " + Interpreter.stringify(result));
            });


            // ambiguity questions if the quantifier of the parser is "the", or "a" with different parse intrepretations,
            if( ((parses[0].parse.entity != undefined) || (parses[0].parse.location.entity.quantifier == "the"))  && (parses[0].parse.command !="stack"))
            {
              try{

                if( parses[0].parse.entity == undefined ) // some action with the already taken object to a unespecified position-->ask
                {
                    interpretations = Questions(world,interpretations);
                }else{

                  var quantifier1 : string = parses[0].parse.entity.quantifier
                  if( (parses[0].parse.command != "pick up") && (parses[0].parse.command != "grasp") && (parses[0].parse.command != "take")  )
                  {
                    var quantifier2 : string = parses[0].parse.location.entity.quantifier;
                    if ((quantifier1 == "the") || (quantifier2 == "the")  || (interpretations.length > 1))
                    {
                      if ((interpretations.length > 1) || ( interpretations[0].interpretation.length > 1) )
                      {
                        interpretations = Questions(world,interpretations);
                      }
                    }
                  }else{
                    if ((quantifier1 == "the")  || (interpretations.length > 1))
                    {
                      if ((interpretations.length > 1) || ( interpretations[0].interpretation.length > 1) )
                      {
                        interpretations = Questions(world,interpretations);
                      }
                    }
                  }
                }
              }
              catch(err) {
                world.printError("Questions error", err);
                return;
              }
            }
        }
        catch(err) {
            world.printError("Interpretation error", err);
            return;
        }

        // Planning
        try {
            var plans : Planner.PlannerResult[] = Planner.plan(interpretations, world.currentState);
            world.printDebugInfo("Found " + plans.length + " plans");
            plans.forEach((result, n) => {
                world.printDebugInfo("  (" + n + ") " + Planner.stringify(result));
            });

            if (plans.length > 1) {
                // several plans were found -- how should this be handled?
                // this means that we have several interpretations,
                // should we throw an ambiguity error?
                // ... throw new Error("Ambiguous utterance");
                // or should we select the interpretation with the shortest plan?
                // ... plans.sort((a, b) => {return a.length - b.length});
            }
        }
        catch(err) {
            world.printError("Planning error", err);
            return;
        }

        var finalPlan : string[] = plans[0].plan;
        world.printDebugInfo("Final plan: " + finalPlan.join(", "));
        return finalPlan;
    }


    /** This is a convenience function that recognizes strings
     * of the form "p r r d l p r d"
     */
    export function splitStringIntoPlan(planstring : string) : string[] {
        var plan : string[] = planstring.trim().split(/\s+/);
        var actions : {[act:string] : string}
            = {p:"Picking", d:"Dropping", l:"Going left", r:"Going right"};
        for (var i = plan.length-1; i >= 0; i--) {
            if (!actions[plan[i]]) {
                return;
            }
            plan.splice(i, 0, actions[plan[i]]);
        }
        return plan;
    }

}

// avoid several floor, avoid a/the, already true? ...
function Questions(world : World,interpretations : Interpreter.InterpretationResult[]) : Interpreter.InterpretationResult[]
{

  var interp0 : string;
  var firstInterp : number = 0;
  var iInterpCount : number = 0;
  var interpCount = new Array();
  interpCount[0] = new Array();  // count iParse
  interpCount[1]= new Array(); // count iInterp

  var nParses : number = interpretations.length;
  for (var iParse= 0; iParse<nParses; iParse++)
  {


    var floorAppear : boolean = false;
    var floorCount : number[]=[];
    var isFloor : boolean[] = [];
    var nInterpretations : number = interpretations[iParse].interpretation.length;
    for (var iInterp= 0; iInterp<nInterpretations ; iInterp++)
    {


      var nConj : number = interpretations[iParse].interpretation[iInterp].length;
      for (var iConj= 0; iConj< nConj; iConj++)
      {

        var thisInterp : string ="";
        var rel : string = interpretations[iParse].interpretation[iInterp][iConj].relation;
        var nArgs : number = interpretations[iParse].interpretation[iInterp][iConj].args.length
        var arg : string[];
        arg = interpretations[iParse].interpretation[iInterp][iConj].args;

        if(nArgs > 1)
        {
          if(arg[1].substring(0,6) === "floor-") // we dont want to count all the floors for the interpretation
          {
            floorAppear = true;
            floorCount[iInterpCount] = 0;
          }else{
            floorAppear = false;
          }
        }else{
          floorAppear = false;
        }

        // just show one time per floor, and count how many floors...
        if(floorAppear)
        {
          if(arg[1].substring(6,7) === "0")
          {
            // it creates the string output for the question:
            thisInterp = thisInterp + objectInterpretation(arg[0]) + rel + " the floor ";
            if ( (nConj>1) && (iConj<nConj-1) )
            {
              thisInterp = thisInterp + " and ";
            }
            firstInterp++;
            //print and count:
            switch (firstInterp)
            {
              case 1:
                interp0 = thisInterp;
                interpCount[0][iInterpCount]=iParse;
                interpCount[1][iInterpCount]=iInterp;
                isFloor[iInterpCount] = true;
                floorCount[iInterpCount] = 1;
                break;

              case 2:
                world.printSystemOutput("There are several interpretations: ")
                world.printSystemOutput(iInterpCount +".- " + interp0);
                iInterpCount++;
                world.printSystemOutput(iInterpCount +".- " + thisInterp);
                interpCount[0][iInterpCount]=iParse;
                interpCount[1][iInterpCount]=iInterp;
                isFloor[iInterpCount] = true;
                floorCount[iInterpCount] = 1;
                iInterpCount++;
                break;
              default:
             }

             if(firstInterp > 2)
             {
               world.printSystemOutput(iInterpCount +".- " + thisInterp);
               interpCount[0][iInterpCount]=iParse;
               interpCount[1][iInterpCount]=iInterp;
               isFloor[iInterpCount] = true;
               floorCount[iInterpCount] = 1;
               iInterpCount++;
             }

          }else{
            floorCount[iInterpCount-1]++;
          }

        }else{ //floor not appear
          // it creates the string output for the question:
          if(nArgs > 1)
          {
            thisInterp = thisInterp + objectInterpretation(arg[0])+ rel + " "+objectInterpretation(arg[1]);
          }else{
            thisInterp = thisInterp + rel + " " + objectInterpretation(arg[0]);
          }
          if ( (nConj>1) && (iConj<nConj-1) )
          {
            thisInterp = thisInterp + " and ";
          }
          firstInterp++;
          //print and count:
          switch (firstInterp)
          {
            case 1:
              interp0 = thisInterp;
              interpCount[0][iInterpCount]=iParse;
              interpCount[1][iInterpCount]=iInterp;
              isFloor[iInterpCount] = true;
              floorCount[iInterpCount] = 1;
              break;

            case 2:
              world.printSystemOutput("There are several interpretations: ")
              world.printSystemOutput(iInterpCount +".- " + interp0);
              iInterpCount++;
              world.printSystemOutput(iInterpCount +".- " + thisInterp);
              interpCount[0][iInterpCount]=iParse;
              interpCount[1][iInterpCount]=iInterp;
              isFloor[iInterpCount] = true;
              floorCount[iInterpCount] = 1;
              iInterpCount++;
              break;

            default:
           }
           if(firstInterp > 2)
           {
             world.printSystemOutput(iInterpCount +".- " + thisInterp);
             interpCount[0][iInterpCount]=iParse;
             interpCount[1][iInterpCount]=iInterp;
             isFloor[iInterpCount] = true;
             floorCount[iInterpCount] = 1;
             iInterpCount++;
           }
        }

      }

    }

  }
  if(firstInterp>1)
  {
    var userReading = prompt("What interpretation do you mean? (Answer with a number)","0");
    var iUserInterp : number = +userReading;
    world.printSystemOutput("User interpretation: " + iUserInterp);

    var result : Interpreter.InterpretationResult[] = [];
    result[0] = interpretations[interpCount[0][iUserInterp]]; //takes all the interpretations to the planner
    if (isFloor[iUserInterp])
    {
      for(var iFloor=0;iFloor<floorCount[iUserInterp];iFloor++) // it returns all the floors asociated with the user interpretation
      {
        result[0].interpretation[iFloor]= interpretations[interpCount[0][iUserInterp]].interpretation[interpCount[1][iUserInterp]+iFloor];
      }
      result.splice(1,result.length-1);
      result[0].interpretation.splice(floorCount[iUserInterp],result[0].interpretation.length-floorCount[iUserInterp]);

    }else{

    result[0].interpretation[0] = interpretations[interpCount[0][iUserInterp]].interpretation[interpCount[1][iUserInterp]];
    result.splice(1,result.length-1);
    result[0].interpretation.splice(1,result[0].interpretation.length-1);
    }
    //world.printSystemOutput("result: "+result[0].interpretation[0][0].relation+ " "+result[0].interpretation[0][0].args)

    return result;
  }else{
    return interpretations;
  }

}





function objectInterpretation(objectIN : string) :string
{
  var objectOUT : string;

  switch (objectIN)
    {
    case'e':
      objectOUT = "large white ball ";
      break;
    case'a':
      objectOUT = "large green brick ";
      break;
    case'l':
      objectOUT = "large red box ";
      break;
    case'i':
      objectOUT = "large yellow pyramid ";
      break;
    case'h':
      objectOUT = "small red table ";
      break;
    case'j':
      objectOUT = "small red pyramid ";
      break;
    case'k':
      objectOUT = "large yellow box ";
      break;
    case'g':
      objectOUT = "large blue table ";
      break;
    case'c':
      objectOUT = "large red plank ";
      break;
    case'b':
      objectOUT = "small white brick ";
      break;
    case'd':
      objectOUT = "small green plank ";
      break;
    case'm':
      objectOUT = "small blue box ";
      break;
    case'f':
      objectOUT = "small black ball ";
      break;
    default:

    }

  return objectOUT;

}
