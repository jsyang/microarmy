define ->
  (map, world) ->
  
    if map? and world?
  
      # Survival gameplay style.

      # Wave after wave of enemies attack
      # Kill them, salvage weapons, upgrade your base

      # build / deploy cursor

      survival =
        funds       : $.R(200,500)
        funding     : -> $.R(1,2)

        inventory :
          Barracks        : 1
          PistolInfantry  : 4
          AmmoDumpSmall   : 1

      cost = 
        PistolInfantry    : 50
        RocketInfantry    : 200
        EngineerInfantry  : 400

        CommCenter        : 18000
        Barracks          : 9000
        CommRelay         : 2000
        #WatchTower        : 000
        #AmmoDump          : 000
        #AmmoDumpSmall     : 000
        MineFieldSmall    : 700
        #Depot             : 000
        #RepairYard        : 000
        #Helipad           : 000
        Pillbox           : 3000
        SmallTurret       : 8000
        MissileRack       : 32000
        MissileRackSmall  : 16000
   
      
      ACTION =
        BUILD   : 0
        DEPLOY  : 1
        RALLY   : 2
        PATROL  : 3
        RETREAT : 4

      state = 
        action : ACTION.DEPLOY
        click :
          _special  : null
          
    


      keypress = (e) ->

        switch e.which
          when 97, 65 # A
            state.action = ACTION.BUILD



        map.ctx.Message =
          text : "Key pressed: #{e.which}"
          time : 40
    
      click = (e) ->
        # Play a sound!
        soundManager.play('click')
        
        [sx,  sy]     = [map.scrollLeft,  map.scrollTop]
        [x,   y]      = [e.pageX+sx,      e.pageY+sy]
        
      
      cursor = null

      drawCursor = (e) ->
        if !(cursor?)
          cursor = preloader.getFile('cursor-select')

        [sx,  sy]     = [map.scrollLeft,  map.scrollTop]
        [x,   y]      = [e.pageX+sx,      e.pageY+sy]

        map.FG.ctx.clear()
        map.FG.ctx.draw({
          img     : cursor
          imgdx   : 0
          imgdy   : 0
          imgw    : 15
          imgh    : 15
          worldx  : x - 8
          worldy  : y - 8
        })

      # Hide current cursor
      map.style.cursor = 'none'

      return {
        click :
          context : map
          func    : click
        
        mousemove :
          context : map
          func    : drawCursor

        keypress :
          context : document.body
          func    : keypress
      }
    else
      throw new Error 'no battle map view / battle world assigned to this ui behavior!'
    