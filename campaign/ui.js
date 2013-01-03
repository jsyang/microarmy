var MOUSEMODE={
  SELECT:0,
  
  NONE:Infinity
};

window.onmousemove=function(e){
  var x=e.pageX, y=e.pageY;
  var a;
  switch(world._.mode) {
    case MOUSEMODE.SELECT:
      world._.view.highlight(x,y);
      break;
    case MOUSEMODE.NONE:
  }
};
