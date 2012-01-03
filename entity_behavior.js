// Behavior tree implementation here ///////////////////////////////////////////
var Behavior={
  
  RESULT:{
    OK:0,     // continue deeper
    TICK:1,   // bail out of all levels
    FAIL:2
  },
  
  /*
  behavior tree json...:
  {
    id:   'name of strat',
    strat:'name of execute token',
    children:[]
  }
  */
  
  Execute:function(tree,thisArg){
    if(!tree.id) return alert('No strategy specified!');
    switch(tree.id) {
      
      case 'sequence':  // Quit on first FAIL
        for(var i=0; i<tree.children.length; i++)
          if(Behavior.Execute(tree.children[i],thisArg)==Behavior.RESULT.FAIL)
            return Behavior.RESULT.FAIL;
        return Behavior.RESULT.OK;
        break;
      
      case 'selector':  // Quit on first SUCCESS
        for(var i=0; i<tree.children.length; i++)
          if(Behavior.Execute(tree.children[i],thisArg)==Behavior.RESULT.OK)
            return Behavior.RESULT.OK;
        return Behavior.RESULT.FAIL;
        break;
      
      case 'lookup':    // to do: lookup decorator
        break;
      
      default:          // Custom node behavior and decorators.
        if(!Behavior.Custom[tree.id])
          return alert('Custom behavior not found!');
        var result=Behavior.Custom[tree.id](thisArg);
        if(tree.children && result==Behavior.RESULT.OK)
          return Behavior.Execute(tree.children[0]);
        else
          return result;
    }
    return alert('ERROR: You are not supposed to see this!');
  },
  
// Custom decorators and tasks /////////////////////////////////////////////////
  Custom:{
    
    isDead:function(obj) {
      return obj._.health<=0? Behavior.RESULT.OK : Behavior.RESULT.FAIL;
    },
    
    isOutsideWorld:function(obj) {
      return world.isOutside(this)? Behavior.RESULT.OK : Behavior.RESULT.FAIL;
    },
    
    loopAnimation:function(obj) {
      if(++_.frame.current>_.frame.last) _.frame.current=_.frame.first;
      return Behavior.RESULT.OK;
    },
    
    movePawn:function(obj) {
      obj.x+=obj._.direction;
      obj.y=world.getHeight(obj.x);
    }
    
  }
};


