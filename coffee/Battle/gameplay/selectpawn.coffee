define ->
  
  class SelectPawn
    x : 0
    y : 0
        
    selection : null
    
    containsPoint : (x, y) ->
      return @ if ( @x <= x <= @x+@w ) and ( @y <= y <= @y+@h )
    
    containsCursor : ->
      @containsPoint(atom.input.mouse.x, atom.input.mouse.y)
    
    _clearSelection : ->
      @selection = []
    
    _isDragging : false
    _dragRect :
      x : 0
      y : 0
    
    constructor : (params) ->
      @[k]  = v for k, v of params
      @w    = atom.width
      @h    = @battle.world.h
    
    _calculateSelectionBounds : ->
      dr = @_dragRect
      mx = atom.input.mouse.x
      my = atom.input.mouse.y
      x = dr.x
      y = dr.y
      w = Math.abs(x - mx) - 1
      h = Math.abs(y - my) - 1
      x = mx if mx < dr.x
      y = my if my < dr.y
      {
        x
        y
        w
        h
      }
    
    draw : ->
      if @_isDragging
        atom.context.save()
        atom.context.lineWidth = '1'
        atom.context.strokeStyle = 'rgb(128,128,128)'
        dr = @_calculateSelectionBounds()
        atom.context.strokeRect dr.x + 0.5, dr.y + 0.5, dr.w, dr.h
        atom.context.restore()
    
    tick : ->
      if @containsCursor()
        mx = atom.input.mouse.x
        my = atom.input.mouse.y
        
        if atom.input.pressed('mouseleft') and not @_isDragging
          @_isDragging = true
          @_dragRect =
            x : mx
            y : my
              
        if atom.input.released('mouseleft') and @_isDragging
          @_isDragging = false  
          
      else
        @_isDragging = false