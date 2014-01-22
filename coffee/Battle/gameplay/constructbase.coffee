define ->
  
  class ConstructBase
    x : 0
    y : 0
    direction : 0
    
    containsPoint : (x, y) ->
      return @ if ( @x <= x <= @x+@w ) and ( @y <= y <= @y+@h )
    
    containsCursor : ->
      @containsPoint(atom.input.mouse.x, atom.input.mouse.y)
    
    # Base starter kit
    inventory :
      Barracks  : 1
      Pillbox   : 1
        
    cart : 'Barracks'
      
    constructor : (params) ->
      @[k]  = v for k, v of params
      @w    = atom.width
      @h    = @battle.world.h
      @_cullInventory()
      
    _getSpriteName : ->
      name      = @cart.toLowerCase()
      direction = @direction
      state     = 0
      
      "#{name}-#{@battle.team}-#{@direction}-#{state}"
    
    draw : ->
      mx = atom.input.mouse.x
      my = atom.input.mouse.y
      
      if @cart?
        spriteName = @_getSpriteName()
        isLocationValid = @_checkIfLocationValid()
        if isLocationValid
          opacity = 0.75
        else
          margin = GFXINFO[spriteName].height + 20
          atom.context.drawText "Cannot build here", mx - 46, @battle.world.height(mx + @battle.scroll.x) - margin, "#ff0000"
          opacity = 0.3
        
        directionName = [
          'left'
          'right'
        ][@direction]
        
        teamName = [
          'blue'
          'green'
        ][@battle.team]
          
        instructionText = [
          "Click location to build #{@cart} for #{teamName} team"
          "(Facing #{directionName})"
          "Press A to build facing left\n"
          "Press D to build facing right"
        ]
                          
        atom.context.drawText instructionText
        atom.context.drawSprite spriteName, mx, @battle.world.height(mx + @battle.scroll.x), 'bottom', 'center', opacity
    
    _checkIfLocationValid : ->
      x = @battle.scroll.x + atom.input.mouse.x
      name = @_getSpriteName()
      w = GFXINFO[name].width
      w2 = w>>1
      numberOfDifferentHeights = 0
      baseline = @battle.world.height x
      for i in [x-w2..x+w2]
        if @battle.world.height(i) != baseline
          numberOfDifferentHeights++
      
      # Threshold for valid
      w * 0.35 > numberOfDifferentHeights
    
    _cullInventory : (entity) ->
      @inventory[entity]-- if @inventory[entity]?
      delete @inventory[entity] if @inventory[entity] is 0
      return @cart = k for k, v of @inventory
      @_constructionComplete()
      
    _constructionComplete : ->
      @battle.switchMode 'SpawnPawn' # 'SelectPawn'
    
    tick : ->
      if @containsCursor()
        if atom.input.pressed('keyA')
          @direction = 0
        else if atom.input.pressed('keyD')
          @direction = 1
          
        if atom.input.pressed('mouseleft')
          if @_checkIfLocationValid()
            x = atom.input.mouse.x + @battle.scroll.x
            
            @battle.world.add(
              new @battle.world.Classes[@cart] {
                x         : x
                y         : @battle.world.height(x)
                team      : @battle.team
                direction : @direction
              }
            )
            
            @_cullInventory @cart
            atom.playSound 'tack'
          
          else
            atom.playSound 'invalid'
        