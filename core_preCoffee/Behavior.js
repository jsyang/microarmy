// Behavior tree ////////////////////////////////////////////////////////////////////////
define(function() {
  var Behavior = {
  
    Execute : function(tree,thisArg){
      
      if(!tree.id) return alert('No strategy specified!');
      
      switch(tree.id) {
        
        case 'sequence':  // Quit on first false
          for(var i=0; i<tree.children.length; i++)
            if(!Behavior.Execute(tree.children[i],thisArg)) return false;
          return true;
        
        case 'selector':  // Quit on first true
          for(var i=0; i<tree.children.length; i++)
            if(Behavior.Execute(tree.children[i],thisArg)) return true;
          return false;
        
        default:          // Custom behavior and decorators
                          // lookup trees in the behavior tree library.
          var invert=tree.id.charAt(0)==='!';
          var realId=invert?tree.id.slice(1):tree.id;
          var behavior=Behavior.Custom[realId];
          if(typeof(behavior)==="boolean") return behavior;
          
          if(behavior)
            return invert? !behavior.call(thisArg) : behavior.call(thisArg);
          
          var subtree=Behavior.Library[realId];        
          if(subtree)
            return invert?
              !Behavior.Execute(subtree, thisArg)
              :Behavior.Execute(subtree, thisArg);
          
          return console.log("Custom decorator / subtree '"+realId+"'not found!");
      }
      return alert('ERROR: You are not supposed to see this!');
    },
    
    ConvertShortHand:function(code){
      return eval('('+
        code
        .replace(/\[/g, '{id:"')
        .replace(/\]/g, '"}')
        .replace(/\(/g, '{id:"selector",children:[')
        .replace(/</g,  '{id:"sequence",children:[')
        .replace(/>/g,  ']}')
        .replace(/\)/g, ']}')+
      ')');
    }
    
  };
  
  return Behavior;

});
