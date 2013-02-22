# Behaviors for a Campaign
define {
  
  Decorators :
    
    TRUE  : true
    FALSE : false
    
    isStoreEmpty : ->
      @store.isEmpty()
      
    printXY : ->
      console.log(@x, @y)
      true
  
    tryDecayResources : ->
      @.store.tryDecay()
      true
  
  Trees :
    
    Tile : '<[!isStoreEmpty], [printXY], [tryDecayResources]>'
  
}