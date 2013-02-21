define {
  
  Decorators :
    
    TRUE  : true
    FALSE : false
    
    storeEmpty : ->
      @store.isEmpty()
      
    printXY : ->
      console.log(@x, @y)
      true
  
  
  Trees :
    
    Tile : '<[!storeEmpty], [printXY]>'
  
}