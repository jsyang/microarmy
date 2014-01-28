define [
  'core/Battle/UI'
  'core/Battle/UI/pawn.label.box'
  'core/Battle/UI/pawn.stats'
], (BattleUI, PawnLabelBox, PawnStatsBar) ->
  # Select and send orders to selected entities.
  class CommandPawn extends BattleUI
    x : 0
    y : 0
   
    isDragging : false
    
    # Doubles as a stand in for a pawn when used as an XHash query to select structures
    dragRect :
      x : 0
      y : 0
    
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
    
    _clearSelection : ->
      @_clearSingleSelection()
      @units = []
    
    _clearSingleSelection : ->
      delete @labelbox
      delete @structure
      @statsbars = []
    
    # Multiple select = units only
    _findMultiple : ->
      unless atom.input.mouse.x is @dragRect.x and atom.input.mouse.y is @dragRect.y
        rect = @_calculateSelectionBounds()
        rect.x += @battle.scroll.x
        @units = @battle.world.XHash.getFriendlyWithinBoundsUI(
          rect.x,
          rect.y,
          rect.x + rect.w,
          rect.y + rect.h,
          @battle.player.team
        )
        @_clearSingleSelection()
        return @units.length > 0
      false
      
    # Single select = both units and structures
    _findSingle : ->
      result = @battle.world.XHash.getNearestFriendlyUI {
        x     : @battle.scroll.x + atom.input.mouse.x
        y     : @battle.scroll.y + atom.input.mouse.y
        team  : @battle.player.team
      }
      if result?
        if result != @structure or result != @units[0]
          @_clearSelection()
          if result instanceof @INFANTRY
            @units = [result]
            @battle.voices.UNITSSELECTED()
          else if result instanceof @STRUCTURE
            @structure = result
            # Only add label box for Structures
            @labelbox = new PawnLabelBox result, @battle
      result
      
    # Prune dead things from our selection
    _updateSelection : ->
      if @structure?
        if @structure.isDead() or @structure.isPendingRemoval()
          @_clearSelection()
      else if @units.length
        newUnits = []
        for u in @units
          if u.isDead() or u.isPendingRemoval()
            for b, i in @statsbars when b? and b.pawn is u
              delete @statsbars[i]
          else
            newUnits.push u
        @units = newUnits
    
    _drawStatsBars : ->
      for i in @statsbars when i?
        i.draw()
        
    _selectSingleOrDrag : ->
      foundSingle = @_findSingle()
      if foundSingle?
        @statsbars.push new PawnStatsBar foundSingle, @battle
        return true
      else
        @isDragging = true
        @dragRect =
          x : atom.input.mouse.x
          y : atom.input.mouse.y
        return false
    
    _addMultipleStatsbars : ->
      for u in @units
        @statsbars.push new PawnStatsBar u, @battle
    
    _selectMultipleOrCancelDrag : ->
      @isDragging = false
      foundMultiple = @_findMultiple()
      if foundMultiple
        @battle.voices.UNITSSELECTED()
        @_addMultipleStatsbars()
    
    _hasSelection : ->
      @structure? or @units.length > 0
    
    _selectedSetRally : ->
      if @units.length
        x = 0
        for u, i in @units
          u.goal = u.GOAL.MOVE_TO_RALLY
          u.rally = {
            x : atom.input.mouse.x + @battle.scroll.x + x
            y : atom.input.mouse.y
          }
          x += $.R(1, u._halfWidth << 2) # Move as a group but not into 1 spot.
        @battle.voices.UNITORDERRECEIVED()
        # Make sure we don't deselect
        @isDragging = false
    
    resize : ->
      @w = atom.width - @battle.ui.sidebar.w
      @h = @battle.world.h
        
    draw : ->
      @labelbox?.draw()
      
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
      selected = @_hasSelection()
      
      @_updateSelection() if selected
      
      if @containsCursor()
        Lpressed   = atom.input.pressed  'mouseleft'
        Lreleased  = atom.input.released 'mouseleft'
        Ldown      = atom.input.down     'mouseleft'
        
        Rpressed   = atom.input.pressed  'mouseright'
        Rreleased  = atom.input.pressed  'mouseright'
        Rdown      = atom.input.down     'mouseright'

        # Needs work here. Dragging should still work when units are selected.

        if @isDragging
          if Lreleased
            @_selectMultipleOrCancelDrag()
        
        else
          if Lpressed
            foundSingle = @_selectSingleOrDrag()
            if not foundSingle
              @_selectedSetRally()
          if Rpressed
            @_clearSelection()
            
        @battle.ui.cursor.clearText()
        
      else
        @isDragging = false
        
    constructor : (params) ->
      @[k]  = v for k, v of params
      @resize()
      
      @STRUCTURE = @battle.world.Classes['Structure']
      @INFANTRY  = @battle.world.Classes['Infantry']
      @_clearSelection()