define ->
  # add terrain to the world.
  (_) ->

    if _.w? and _.h? and _.coarsemap?
    
      # 2D map array. fine tiles
      map = (({
        x       : x
        y       : y
        height  : _.coarsemap[(y*0.2)>>0][(x*0.2)>>0].height
      } for x in [0..._.w*5]) for y in [0..._.h*5])
      
      
      # func to draw a filled circle around a point, within a coarsemap tile.
      circFill = (x, y, r, height, bounds) ->
        r2 = r*r
        (
          (
            if (bounds.y1 <= dy < bounds.y2) and (bounds.x1 <= dx < bounds.x2)
              [x2, y2] = [dx-x, dy-y]
              y2 *= y2
              x2 *= x2
              
              tile = map[dy][dx]
              if tile? and x2+y2<r2 and tile.height > height
                if tile.height-1>height
                  tile.height--
                else 
                  tile.height = height
          ) for dx in [x-r..x+r]
        ) for dy in [y-r..y+r]
        return

      # build fine terrain map
      # 1. use 3x3 tiles to check around the center
      # 2. if compared tile is lower than center, take 1 or 2 "bites" out of the center
      # 3. if center tile is totally surrounded by tiles of an equal height,
      #    clear with lower height and draw 2 blobs for "islands"
      
      getCoarseTile = (x,y,centerHeight) ->
        if _.coarsemap[y]? and _.coarsemap[y][x]? and _.coarsemap[y][x].height < centerHeight
          _.coarsemap[y][x]
      
      (
        (
          
          center       = _.coarsemap[y][x]
          centerHeight = center.height
          bounds =
            x1 : (x*5)
            x2 : (x*5)+5
            y1 : (y*5)
            y2 : (y*5)+5
          
          
          N   = getCoarseTile(x  ,y-1,centerHeight)
          S   = getCoarseTile(x  ,y+1,centerHeight)
          W   = getCoarseTile(x-1,y  ,centerHeight)
          E   = getCoarseTile(x+1,y  ,centerHeight)
          
          NW  = getCoarseTile(x-1,y-1,centerHeight)
          NE  = getCoarseTile(x+1,y-1,centerHeight)
          SE  = getCoarseTile(x+1,y+1,centerHeight)
          SW  = getCoarseTile(x-1,y+1,centerHeight)
                      
          if N? then circFill( $.R(bounds.x1,bounds.x2), bounds.y1, $.R(2,5), N.height, bounds)
          if E? then circFill( bounds.x2, $.R(bounds.y1,bounds.y2), $.R(2,5), E.height, bounds)
          if S? then circFill( $.R(bounds.x1,bounds.x2), bounds.y2, $.R(2,5), S.height, bounds)
          if W? then circFill( bounds.x1, $.R(bounds.y1,bounds.y2), $.R(2,5), W.height, bounds)
          
          if NW? then circFill( bounds.x1, bounds.y1, $.R(2,5), NW.height, bounds)
          if NE? then circFill( bounds.x2, bounds.y1, $.R(2,5), NE.height, bounds)
          if SE? then circFill( bounds.x2, bounds.y2, $.R(2,5), SE.height, bounds)
          if SW? then circFill( bounds.x1, bounds.y2, $.R(2,5), SW.height, bounds)
          
        ) for x in [0..._.w]
      ) for y in [0..._.h]
      
      # adjust the peaks
      (
        peak.x *= 5
        peak.x += 2
        
        peak.y *= 5
        peak.y += 2
      ) for peak in _.peaks
      
      # adjust the new map dimensions
      _.w *= 5
      _.h *= 5
      
      $.extend {
        map
      }, _
    
    else
      throw new Error 'coarsemap not found!'