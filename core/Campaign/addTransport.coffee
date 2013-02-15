define ['core/util/$'], ($) ->
  
  # add terrain to the world.
  (_) ->
    # _ = $.extend {}, _
    
    # todo: generate different transport types, not just roads
    # gravel / dirt road,
    # rail,
    # high speed rail,
    #  monorail (fastest?),

    if !_.map? or !_.locations?
      throw new Error 'map or location not set!'

    else      
      
      pave = (tile) ->
        if tile.height >= _.seaLevel
          tile.road = true
        else
          false
      
      route = (c,d) ->
        [a,b] = if d.x<c.x then [c,d] else [d,c]
        dx    = if a.x<b.x then 1 else -1
        dy    = if a.y<b.y then 1 else -1
        
        # vertical
        if a.x == b.x
          y = a.y
          while y != b.y
            break unless pave _.map[y][a.x]
            y += dy
        
        # horizontal
        else if a.y == b.y
          x = a.x
          while x != b.x
            break unless pave _.map[a.y][x]
            x += dx
        
        #
        #   A-----|
        #         | <--------- split on x
        #         |
        #         |----B
        #
        #           OR
        #
        #   A
        #   |__________ <----- split on y
        #             |
        #             B
        #
        # 50-50 chance of either X or Y
        else
          if $.R(0,1)
            dxGZ    = dx>0
            xSplit  = if dxGZ then $.R(a.x,b.x) else $.R(b.x,a.x)
            
            # join A to the split
            x = a.x+dx
            (
              break unless pave _.map[a.y][x]
              x += dx
            ) while (dxGZ and x<xSplit) or (!dxGZ and x>xSplit)
            
            # join B to the split
            x = b.x-dx
            (
              break unless pave _.map[b.y][x]
              x -= dx
            ) while (dxGZ and x>=xSplit) or (!dxGZ and x<=xSplit)
            
            # pave the split
            y = a.y
            (
              break unless pave _.map[y][xSplit]
              y += dy
            ) while y != b.y
            
          else
            dyGZ    = dy>0
            ySplit  = if dyGZ then $.R(a.y,b.y) else $.R(b.y,a.y)
            
            # join A to the split
            y = a.y+dy
            (
              break unless pave _.map[y][a.x]
              y += dy
            ) while (dyGZ and y<ySplit) or (!dyGZ and y>ySplit)
            
            # join B to the split
            y = b.y-dy
            (
              break unless pave _.map[y][b.x]
              y -= dy
            ) while (dyGZ and y>=ySplit) or (!dyGZ and y<=ySplit)
            
            # pave the split
            x = a.x
            (
              break unless pave _.map[ySplit][x]
              x += dx
            ) while x != b.x
        return
      
      # try connecting the locations with roads
      locs = _.locations
      if locs.length>1
        (
          # 66% chance of routing any location to any other
          if $.R(0,2)
            route loc, $.pickRandom($$.without(locs, loc))
        ) for loc in locs
      
      _
