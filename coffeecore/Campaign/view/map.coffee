# Draw the world map.
define ->
  (world) ->    
    map = world.map
    
    getTile = (x,y) ->
      if map[y]? and map[y][x]? then map[y][x] else {}
        
    roadClass = (t) ->
      [x, y] = [t.x, t.y]
        
      N = getTile(  x  , y-1  ).road
      S = getTile(  x  , y+1  ).road
      E = getTile(  x+1, y    ).road
      W = getTile(  x-1, y    ).road
      
      if  N and  S  and  E  and  W  then return 'r2'
      if  N and  S  and  E  and !W  then return 'r8'
      if  N and  S  and !E  and  W  then return 'r7'
      if  N and !S  and  E  and  W  then return 'r10'
      if !N and  S  and  E  and  W  then return 'r9'
      if  N and !S  and  E  and !W  then return 'r6'
      if !N and  S  and  E  and !W  then return 'r5'
      if  N and !S  and !E  and  W  then return 'r4'
      if !N and  S  and !E  and  W  then return 'r3'
      if !E and !W                  then return 'r0'
      if !N and !S                  then return 'r1'
      
      'r2'
    
    html = ''
    
    (
      html += '<div>'
      
      (
        html += '<span id="mapx' + x + 'y' + y + '" '
        
        tile      = getTile x, y
        tileClass = []
        tileStyle = ''
        
        if tile.location
          tileClass.push tile.location.type
          
        else if tile.road
          tileClass.push( roadClass(tile) )
        
        else
          shade = if tile.height>15 then 15 else tile.height
          water = shade + 2
          
          if tile.height < world.seaLevel
            color = water.toString(16) + water.toString(16) + 'f'
          else
            color = shade.toString(16) + 'f' + shade.toString(16)
          
          tileStyle = 'style="background:#'+color+'"'
        
        html += 'class="' + tileClass.join(' ') + '" ' + tileStyle + '></span>'
        
      ) for x in [0..world.w-1]
      
      html += '</div>'
      
    ) for y in [0..world.h-1]
    
    el           = document.createElement 'div'
    el.innerHTML = html
    el.className = 'map'
    
    el.style.width = document.width - 180;
    
    el
    