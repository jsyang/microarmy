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
        Projectile : [
          'HomingMissile'
          'HomingMissileSmall'
        ]
    
      availableClasses = classCategories.Infantry
      
      availableTeams = [
        0
        1
      ]
    
      currentClick =
        _special  : null
        _class    : availableClasses[0]
        _classi   : 0
        _team     : availableTeams[0]
        _teami    : 0
    
      window.onkeypress = (e) ->
        #console.log(e.which)
        
        switch e.which
          # Special options
          when 122, 90
            switch currentClick._class
              when 'EngineerInfantry'
                message = 'Click to set scaffold location.'
                currentClick._special = { build : { type : 'Pillbox', x : null } }
            specialOption = true
        
          # Choosing a category of classes
          when 49
            categoryChoose = 'Infantry'
          when 50
            categoryChoose = 'Explosion'
          when 51
            categoryChoose = 'Structure'
          when 52
            categoryChoose = 'Projectile'
            
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
          availableClasses = classCategories[categoryChoose]
          map.ctx.Message =
            text : "#{categoryChoose} classes."
            time : 40
        else if specialOption? and message?
          map.ctx.Message =
            text : message
            time : 40
    
      map.onclick = (e) ->
        [sx,  sy]     = [map.scrollLeft,  map.scrollTop]
        [x,   y]      = [e.pageX+sx,      e.pageY+sy]
        currentClass  = world.Classes[currentClick._class]
        
        if currentClick._special? and currentClick._special.build? and !(currentClick._special.build.x?)
            currentClick._special.build.x = x
            map.ctx.Message =
              text : 'Scaffold location set.'
              time : 20
        else
          
          switch currentClass.__super__.constructor.name
            when 'Infantry', 'Structure'
              classSpecificOptions =
                y : world.height(x)
            when 'Projectile'
              classSpecificOptions =
                dy : -4
            
          options = $.extend {
            x
            y
            team  : currentClick._team
          }, currentClick._special
          
          options = $.extend options, classSpecificOptions
          
          instance = new currentClass(options)
          world.add(instance)
          
          # Delete previous special options
          delete currentClick._special
          
    else
      throw new Error 'no battle map view / battle world assigned to this ui behavior!'
    