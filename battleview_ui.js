var MOUSEMODE={
  EXPLOSION:0,
  APC:1,
  PRINTMOUSECOORDS:2,
  ENGINEERBUILDPILLBOX:3,
  SMALLMINE:4,
  MISSILERACK:5,
  
  NONE:Infinity
};

////////////////////////////////////////////////////////////////////////////////

var mode=MOUSEMODE.NONE;
var clicks=[];
window.onkeydown=function(e){
  if(e.which<48 || e.which>58) return;
  mode=e.which-49;
  for(var i in MOUSEMODE)
    if(MOUSEMODE[i]==mode) break;
  console.log("Click = "+i);
};

// BOOM! HEH.
window.onclick=function(e){
  var x=e.pageX, y=e.pageY;
  var a;
  switch(mode) {
    case MOUSEMODE.APC: a=new APC(x,world.getHeight(x),TEAM.BLUE); break;
    case MOUSEMODE.EXPLOSION: a=new SmallExplosion(x,y); break;
    case MOUSEMODE.PRINTMOUSECOORDS: console.log([x,y]); break;
    case MOUSEMODE.ENGINEERBUILDPILLBOX:
      if(clicks.length){
        a=new EngineerInfantry(x,world.getHeight(x),TEAM.BLUE);
        a._.build={ type:Pillbox, x:clicks[0][0] };
        a._.target=a._.build;
        clicks=[];
      } else {
        console.log("Scaffold location selected. Click to deploy Engineer.");
        clicks.push([x,y]);
      }
      break;
    case MOUSEMODE.SMALLMINE:
      a=new SmallMine(x,world.getHeight(x),TEAM.BLUE);
    case MOUSEMODE.MISSILERACK:
      a=new MissileRack(x,world.getHeight(x),TEAM.BLUE);
    case MOUSEMODE.NONE:
  }  
  world.addPawn(a);
};