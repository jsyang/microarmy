define ->
  (map, world) ->
  
    if map? and world?
    
      map.onclick = (e) ->
        [sx, sy] = [map.scrollLeft, map.scrollTop]
        [x,y] = [e.pageX+sx, e.pageY+sy]
        
        world.add(new world.Classes['PistolInfantry']({
          x
          y
          team : $.R(0,1)
          
        }))
      
    else
      throw new Error 'no battle map view / battle world assigned to this ui behavior!'
    