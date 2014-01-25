define [
  'core/Battle/UI/pawnstatsbox'
  'core/Battle/UI/pawnhealthbar'
], (PawnStatsBox, PawnHealthBar) ->
  
  class SelectPawn
    x : 0
    y : 0
        
    structure  : null
    units      : null
    healthbars : null
    
    containsPoint : (x, y) ->
      return @ if ( @x <= x <= @x+@w ) and ( @y <= y <= @y+@h )
    
    containsCursor : ->
      @containsPoint(atom.input.mouse.x, atom.input.mouse.y)
    
    _clearSelection : ->
      delete @statsbox
      delete @structure
      @units = []
      @healthbars = []
    
    isDragging : false
    
    # Doubles as a stand in for a pawn when used as an XHash query to select structures
    dragRect :
      x : 0
      y : 0
      
    constructor : (params) ->
      @[k]  = v for k, v of params
      @w    = atom.width
      @h    = @battle.world.h
      
      @STRUCTURE = @battle.world.Classes['Structure']
      @INFANTRY  = @battle.world.Classes['Infantry']
      @_clearSelection()
    
    _calculateSelectionBounds : ->
      dr = @dragRect
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
    
    # Multiple select = units only
    _findMultiple : ->
    
    # Single select = both units and structures
    _findSingle : ->
      @_clearSelection()
      result = @battle.world.XHash.getNearestFriendlyUI {
        x     : @battle.scroll.x + atom.input.mouse.x
        y     : @battle.scroll.y + atom.input.mouse.y
        team  : @battle.team
      }
      if result?
        if result instanceof @INFANTRY
          @units = [result]
        else if result instanceof @STRUCTURE
          @structure = result
      result
      
    # Prune dead things from our selection
    _updateSelection : ->
    
    
    _drawHealthBars : ->
      for i in @healthbars
        i.draw()
        
    draw : ->
      if @statsbox?
        @statsbox.draw()
      
      if @isDragging
        atom.context.save()
        atom.context.lineWidth = '1'
        atom.context.strokeStyle = 'rgb(128,155,155)'
        dr = @_calculateSelectionBounds()
        atom.context.strokeRect dr.x + 0.5, dr.y + 0.5, dr.w, dr.h
        atom.context.restore()
      else
        @_drawHealthBars()
    
    tick : ->
      if @containsCursor()
        mx = atom.input.mouse.x
        my = atom.input.mouse.y
        
        pressed   = atom.input.pressed  'mouseleft'
        released  = atom.input.released 'mouseleft'
        down      = atom.input.down     'mouseleft'
            
        if pressed and not @isDragging
          foundSingle = @_findSingle()
          if foundSingle?
            @statsbox = new PawnStatsBox foundSingle, @battle
            @healthbars.push new PawnHealthBar foundSingle, @battle
          else
            @isDragging = true
            @dragRect =
              x : mx
              y : my
              
        else if released and @isDragging
          @isDragging = false
          
      else
        @isDragging = false