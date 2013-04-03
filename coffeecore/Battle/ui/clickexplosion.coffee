define ->
  (map, world) ->
  
    if map? and world?
    
      toggleTeam = 0
    
      map.onclick = (e) ->
        [sx, sy] = [map.scrollLeft, map.scrollTop]
        [x,y] = [e.pageX+sx, e.pageY+sy]
        
        toggleTeam = (toggleTeam+1)%2
        
        world.add(new world.Classes['PistolInfantry']({
          x
          y
          team : toggleTeam
        }))
      
    else
      throw new Error 'no battle map view / battle world assigned to this ui behavior!'
    