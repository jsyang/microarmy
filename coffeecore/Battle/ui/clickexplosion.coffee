define ->
  (map, world) ->
  
    if map? and world?
    
      classCategories =
        Infantry : [
          'PistolInfantry'
          'RocketInfantry'
          'EngineerInfantry'
        ]
        Explosion : [
          'FragExplosion'
          'SmallExplosion'
          'FlakExplosion'
          'HEAPExplosion'
          'ChemExplosion'
          
          'SmokeCloud'
          'SmokeCloudSmall'
          'Flame'
          'ChemCloud'
        ]
        Structure : [
          'CommCenter'
          'Barracks'
          'Scaffold'
          'CommRelay'
          'WatchTower'
          'AmmoDump'
          'AmmoDumpSmall'
          'MineFieldSmall'
          'Depot'
          'RepairYard'
          'Helipad'
          'Pillbox'
          'SmallTurret'
          'MissileRack'
          'MissileRackSmall'
        ]
          
    
      availableClasses = classCategories.Infantry
      
      availableTeams = [
        0
        1
      ]
    
      currentClick =
        _class  : availableClasses[0]
        _classi : 0
        _team   : availableTeams[0]
        _teami  : 0
    
      window.onkeypress = (e) ->
        #console.log(e.which)
        
        switch e.which
          # Choosing a category of classes
          when 49
            availableClasses = classCategories.Infantry
            categoryChoose = 'Infantry'
          when 50
            availableClasses = classCategories.Explosion
            categoryChoose = 'Explosion'
            
          # Navigate within current category
          when 87, 119 # W
            currentClick._classi++
            nav = true
          when 81, 113 # Q
            currentClick._classi--
            nav = true
          when 65, 97 # A
            currentClick._teami--
            nav = true
          when 91, 115 # S
            currentClick._teami++
            nav = true
        
        if nav?
          currentClick._classi= Math.abs(currentClick._classi)
          currentClick._teami = Math.abs(currentClick._teami)
          currentClick._class = availableClasses[currentClick._classi%availableClasses.length]
          currentClick._team  = availableTeams[currentClick._teami%availableTeams.length]
          
          map.ctx.Message =
            text : "MouseClick = [#{currentClick._class}, TEAM = #{currentClick._team}]"
            time : 40
        else if categoryChoose?
          map.ctx.Message =
            text : "#{categoryChoose} classes."
            time : 40
    
      map.onclick = (e) ->
        [sx, sy] = [map.scrollLeft, map.scrollTop]
        [x,y] = [e.pageX+sx, e.pageY+sy]
        
        if world.Classes[currentClick._class] instanceof world.Classes.Infantry
          y = world.height(x)
          
        instance = new world.Classes[currentClick._class]({
          x
          y
          team  : currentClick._team
        })
        
        world.add(instance)
      
    else
      throw new Error 'no battle map view / battle world assigned to this ui behavior!'
    