define [
  'core/Battle/UI/pawn.options.box'
  'core/Battle/UI/pawn.stats'
], (PawnOptionsBox, PawnStatsBar) ->
  # Select and send orders to selected entities.
  class CommandPawn
    x : 0
    y : 0
        
    structure  : null
    units      : null
    statsbars : null
    
    containsPoint : (x, y) ->
      return @ if ( @x <= x <= @x+@w ) and ( @y <= y <= @y+@h )
    
    containsCursor : ->
      @containsPoint(atom.input.mouse.x, atom.input.mouse.y)
    
    _clearSelection : ->
      delete @optionsbox
      delete @structure
      @units = []
      @statsbars = []
    
    isDragging : false
    
    # Doubles as a stand in for a pawn when used as an XHash query to select structures
    dragRect :
      x : 0
      y : 0
      
    constructor : (params) ->
      @[k]  = v for k, v of params
      @resize()
      
      @STRUCTURE = @battle.world.Classes['Structure']
      @INFANTRY  = @battle.world.Classes['Infantry']
      @_clearSelection()
    
    resize : ->
      @w = atom.width - @battle.ui.sidebar.w
      @h = @battle.world.h
    
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
      if @structure?.isPendingRemoval()
        @_clearSelection()
      # else if # Prune unit selections
    
    _drawStatsBars : ->
      for i in @statsbars
        i.draw()
        
    draw : ->
      if @optionsbox?
        @optionsbox.draw()
      
      if @isDragging
        atom.context.save()
        atom.context.lineWidth = '1'
        atom.context.strokeStyle = 'rgb(128,155,155)'
        dr = @_calculateSelectionBounds()
        atom.context.strokeRect dr.x + 0.5, dr.y + 0.5, dr.w, dr.h
        atom.context.restore()
      else
        @_drawStatsBars()
    
    tick : ->
      @_updateSelection()
      
      if @containsCursor()
        mx = atom.input.mouse.x
        my = atom.input.mouse.y
        
        pressed   = atom.input.pressed  'mouseleft'
        released  = atom.input.released 'mouseleft'
        down      = atom.input.down     'mouseleft'
            
        if pressed and not @isDragging
          foundSingle = @_findSingle()
          if foundSingle?
            @optionsbox = new PawnOptionsBox foundSingle, @battle
            @statsbars.push new PawnStatsBar foundSingle, @battle
          else
            @isDragging = true
            @dragRect =
              x : mx
              y : my
              
        else if released and @isDragging
          @isDragging = false
          
      else
        @isDragging = false