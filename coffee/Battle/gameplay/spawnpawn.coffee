define ->
  
  class SpawnPawn
    x : 0
    y : 0    
    
    containsPoint : (x, y) ->
      return @ if ( @x <= x <= @x+@w ) and ( @y <= y <= @y+@h )
    
    containsCursor : ->
      @containsPoint(atom.input.mouse.x, atom.input.mouse.y)
    
    constructor : (params) ->
      @[k]  = v for k, v of params
      @w    = atom.width
      @h    = @battle.world.h
    
    draw : ->
      #mx = atom.input.mouse.x
      #my = atom.input.mouse.y

    
    tick : ->
      #if @containsCursor()
      #  if atom.input.pressed('mouseleft')