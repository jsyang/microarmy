define ['core/Battle/UI'], (BattleUI) ->
  
  class ConstructBase extends BattleUI
    
    direction : 0
    
    # Base starter kit
    inventory :
      'CommCenter'        : 1
      #'CommRelay'         : 1
      #'WatchTower'        : 1
      #'AmmoDump'          : 1
      #'AmmoDumpSmall'     : 1
      'Pillbox'           : 1
      #'MineFieldSmall'    : 1
      'SmallTurret'       : 1
      #'MissileRack'       : 1
      # 'MissileRackSmall'  : 1 
      #'Scaffold'          : 1
      #'Barracks'          : 1
      # 'Depot'
      # 'RepairYard'
      # 'Helipad'
      
    cart : 'Barracks'
      
    constructor : (params) ->
      @[k]  = v for k, v of params
      @resize()
      @_cullInventory()
    
    resize : ->
      @w = atom.width - @battle.ui.sidebar.w
      @h = @battle.world.h
    
    _getSpriteName : ->
      if not @_tempInstance?
        @_tempInstance = new @battle.world.Classes[@cart] {
          team      : @battle.team
          direction : @direction
        }
      @_tempInstance.direction = @direction
      @_tempInstance.getName()
       
    draw : ->
      if @containsCursor()
        if @cart?
          mx = atom.input.mouse.x
          my = atom.input.mouse.y
          
          spriteName = @_getSpriteName()
          isLocationValid = @_checkIfLocationValid()        
          if isLocationValid
            opacity   = 0.6
            @battle.ui.cursor.setText {
              value  : "Right click to change direction."
              color  : "#555555"
              halign : 'center'
            }
          else
            opacity = 0.2
            @battle.ui.cursor.setText {
              value  : "Cannot build here!"
              color  : "#ff0000"
              halign : 'center'
            }
          atom.context.drawSprite spriteName, mx, @battle.world.height(mx + @battle.scroll.x), 'bottom', 'center', opacity
      else
        @battle.ui.cursor.clearText()
        
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
      delete @_tempInstance
      return @cart = k for k, v of @inventory
      @_constructionComplete()
      
    _constructionComplete : ->
      @battle.resetMode()
    
    tick : ->
      if @containsCursor()
        if atom.input.pressed('keyW')
          @battle.team++
          @battle.team %= 2
          
        if atom.input.pressed('mouseright')
          if @direction is 0
            @direction = 1
          else
            @direction = 0
          
        if atom.input.pressed('mouseleft')
          if @_checkIfLocationValid()
            x = atom.input.mouse.x + @battle.scroll.x
            atom.playSound 'dropitem'
            @battle.world.add(
              new @battle.world.Classes['Scaffold'] {
                build_type : @cart
                x          : x
                y          : @battle.world.height(x)
                team       : @battle.team
                direction  : @direction
              }
            )
            @_cullInventory @cart
          else
            atom.playSound 'invalid'
        