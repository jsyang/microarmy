var MOUSEMODE={
  EXPLOSION:0,
  APC:1,
  PRINTMOUSECOORDS:2,
  ENGINEERBUILDPILLBOX:3,
  SMALLMINE:4,
  MISSILERACK:5,
  PISTOL:6,
  
  NONE:Infinity
};

////////////////////////////////////////////////////////////////////////////////
/* Auto-scrolling

var DEMO_ACTION={
  X:0,
  SPACEBAR:32,
  CHECKACTION:undefined
};

function smoothAutoScroll() {
  var startX = document.body.scrollLeft;
  var stopX = DEMO_ACTION.X-(window.innerWidth>>1);
  if(stopX<0) return;
  var distance = stopX - startX;
  console.log("chiggity-check: "+[startX,stopX]);
  if(!distance) return;
  var speed = distance>>9;
  if (speed >= 20) speed = 20;
  var step = distance>>4;
  if(stopX>startX)
    for ( var i=startX, timer=0; i<stopX; i+=step, timer++ )
      setTimeout("window.scrollTo("+i+",0)", timer * speed);
  else
    for ( var i=startX, timer=0; i>stopX; i+=step, timer++ )
      setTimeout("window.scrollTo("+i+",0)", timer * speed);
}
*/
////////////////////////////////////////////////////////////////////////////////

var mode=MOUSEMODE.NONE;
var clicks=[];
window.onkeydown=function(e){
  /*
  if(e.which==DEMO_ACTION.SPACEBAR)
    if(DEMO_ACTION.CHECKACTION) {
      clearInterval(DEMO_ACTION.CHECKACTION);
      DEMO_ACTION.CHECKACTION=undefined;
      console.log("Auto-scrolling disabled.");
    } else {
      DEMO_ACTION.CHECKACTION=setInterval(smoothAutoScroll,3000);
      console.log("Auto-scrolling enabled.");
    }
  */  
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
      a=new SmallMine(x,world.getHeight(x),TEAM.BLUE); break;
    case MOUSEMODE.MISSILERACK:
      a=new MissileRack(x,world.getHeight(x),TEAM.BLUE); break;
    case MOUSEMODE.NONE:
  }  
  world.addPawn(a);
};