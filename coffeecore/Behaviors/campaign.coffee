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
  
    tryMaintainResources : ->
      @.store.tryMaintain()
      true
  
  Trees :
    
    Tile : '<[!isStoreEmpty], [printXY], [tryMaintainResources]>'
  
}