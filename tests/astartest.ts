/// <reference path="../vendor/tsUnit.ts" />
/// <reference path="../vendor/collections.ts" />
/// <reference path="../astarAlgorithm.ts" />

module Tests{

//Templates
  class Tuple {
    a: Astar.Node
    b: Astar.Node
  }
  
  //Extend Nodes with coordinates. 
  class Town extends Astar.Node{
    x: number
    y: number
  }
  
  function townTupleToString(t:Tuple){
    return t.a.id + t.b.id;
  }
  
  //Define Hieristic function
  function town_hier(t1:Town,t2:Town){
    return Math.round(Math.sqrt(Math.pow((t1.x - t2.x),2) + Math.pow((t1.y - t2.y),2))) // Pythagoras i.e the bird distance.
  }
  
  var townDistanceDictionary;
  
  function get_town_dist(t1:Town,t2:Town){ //NYI
    var townTuple = new Tuple();
    townTuple.a = t1;
    townTuple.b = t2;
    return townDistanceDictionary.getValue(townTuple);
  }
  
  function set_town_dist(t1:Town,t2:Town,dist:number){
    townDistanceDictionary.setValue({a:t1,b:t2},dist)
    townDistanceDictionary.setValue({a:t2,b:t1},dist)
  }
  
  
  //Extend Nodes with a number
  class Square extends Astar.Node{
    num: number
  }
  function puzzle_hier(t1:Square,t2:Square){ //NYI
    return 0 
  }
  function puzzle_dist(t1:Square,t2:Square){ //NYI
    return 0 
  }
  
  
  export class astarTest extends tsUnit.TestClass {
    /*
    The town problem : 
    "The trivial problem" - page68 AIAMA
    */
    
    gettownDistanceDictionary(){
      return townDistanceDictionary;
    }
    
    set_town_dist(t1:Town,t2:Town,dist:number){
      townDistanceDictionary.setValue({a:t1,b:t2},dist)
    }
    
    
    townProblemTest(){ 

      var zerind = new Town("zerind");
      var oradea = new Town("oradea");
      var arad = new Town("arad"); 
      var sibiu = new Town("sibiu");
      var timisoara = new Town("timisoara");
      var lugoj = new Town("lugoj");
      var mehadia = new Town("mehadia"); 
      var vilcea = new Town("vilcea");
      var craiova = new Town("craiova"); 
      var drobeta = new Town("drobeta");
      var neamt = new Town("neamt");
      var fagaras = new Town("fagaras");
      var pitesti = new Town("pitesti");
      var vaslui = new Town("vaslui");
      var iasi = new Town("iasi");
      var bucharest = new Town("bucharest");
      var urziceni = new Town("urziceni");
      var hirsova = new Town("hirsova");
      var eforie = new Town("eforie");
      var giurgiu = new Town("giurgiu");


      oradea.children = [zerind,sibiu]
      oradea.x = 117;
      oradea.y = 118;
      zerind.children = [arad,oradea]
      zerind.x = 100;
      zerind.y = 149;
      arad.children =[sibiu,timisoara,zerind]
      arad.x = 88;
      arad.y = 175;
      timisoara.children = [arad,lugoj]
      timisoara.x = 89;
      timisoara.y = 236;
      lugoj.children = [timisoara,mehadia]
      lugoj.x = 137
      lugoj.y = 250
      mehadia.children=[lugoj,drobeta]
      mehadia.x = 141
      mehadia.y = 284
      drobeta.children=[mehadia,craiova]
      drobeta.x = 129
      drobeta.y = 314
      sibiu.children = [oradea,arad,vilcea,fagaras]
      sibiu.x = 171
      sibiu.y = 198
      vilcea.children = [sibiu,craiova,pitesti]
      vilcea.x = 187
      vilcea.y = 233
      craiova.children = [drobeta,vilcea,pitesti]
      craiova.x = 202;
      craiova.y = 325;
      fagaras.children = [bucharest,sibiu]
      fagaras.x = 240
      fagaras.y = 203
      pitesti.children = [vilcea,craiova,bucharest]
      pitesti.x = 251
      pitesti.y = 263
      bucharest.children = [fagaras,pitesti,giurgiu,urziceni]
      bucharest.x = 313
      bucharest.y = 296
      urziceni.children = [bucharest,hirsova,vaslui]
      urziceni.x = 351
      urziceni.y = 275
      giurgiu.children = [bucharest]
      giurgiu.x = 291
      giurgiu.y = 332
      vaslui.children = [iasi,urziceni]
      vaslui.x = 387
      vaslui.y = 207
      iasi.children = [vaslui,neamt]
      iasi.x = 364
      iasi.y = 163
      hirsova.children = [urziceni,eforie]
      hirsova.x = 407
      hirsova.y = 297
      neamt.children = [iasi]
      neamt.x = 314
      neamt.y = 141
      eforie.children = [hirsova]
      eforie.x = 427
      eforie.y = 316
      

      townDistanceDictionary = new collections.Dictionary<Tuple, number>(townTupleToString);
      set_town_dist(oradea,zerind,71)
      set_town_dist(arad,zerind,75)
      set_town_dist(oradea,sibiu,151)
      set_town_dist(arad,sibiu,140)
      set_town_dist(arad,timisoara,118)
      set_town_dist(timisoara,lugoj,111)
      set_town_dist(lugoj,mehadia,70)
      set_town_dist(mehadia,drobeta,75)
      set_town_dist(drobeta,craiova,120)
      set_town_dist(sibiu,vilcea,80)
      set_town_dist(vilcea,craiova,146)
      set_town_dist(sibiu,fagaras,99)
      set_town_dist(vilcea,pitesti,97)
      set_town_dist(craiova,pitesti,138)
      set_town_dist(pitesti,bucharest,111)
      set_town_dist(fagaras,bucharest,211)
      set_town_dist(bucharest,giurgiu,90)
      set_town_dist(bucharest,urziceni,85)
      set_town_dist(urziceni,hirsova,98)
      set_town_dist(hirsova,eforie,86)
      set_town_dist(urziceni,vaslui,142)
      set_town_dist(vaslui,iasi,92)
      set_town_dist(iasi,neamt,87)

      var path = Astar.Astar(lugoj,iasi,{heuristic_approx: town_hier,dist_between: get_town_dist})
      //this.areIdentical([],path)
      //[oradea,sibiu,vilcea,craiova]
      return path
      
      
    }

    eightPuzzleTest(){
      //NYI
    }
  }
};
