define ->
  tile8x8 =
    water :
      tile : [3,  0]
    
    sand :
      tile : [1,  1]
      ne   : [0,  2]
      n    : [0,  1]
      nw   : [0,  0]
      se   : [2,  0]
      s    : [2,  1]
      sw   : [2,  2]
      e    : [1,  2]
      w    : [1,  0]
    
    plain :
      tile : [16, 1]
      ne   : [15, 2]
      n    : [15, 1]
      nw   : [15, 0]
      se   : [17, 2]
      s    : [17, 1]
      sw   : [17, 0]
      e    : [16, 2]
      w    : [16, 0]
        
    hill :
      tile : [16, 4]
      ne   : [15, 5]
      n    : [15, 4]
      nw   : [15, 3]
      se   : [17, 5]
      s    : [17, 4]
      sw   : [17, 3]
      e    : [16, 5]
      w    : [16, 3]
    
    butte :
      tile : [16, 7]
      ne   : [15, 8]
      n    : [15, 7]
      nw   : [15, 6]
      se   : [17, 8]
      s    : [17, 7]
      sw   : [17, 6]
      e    : [16, 8]
      w    : [16, 6]
    

  tilegfx = (type,sub='tile') ->
    [r,c] = tile8x8[type][sub]
    {
      imgdx     : c*8
      imgdy     : r*8
      imgw      : 8
      imgh      : 8
      
      #worldx    : 8*x
      #worldy    : 8*y
      imgw      : 8
      imgh      : 8
    }
    
  # each map tile is actually 8*5 = 40 pixels squared
  ->
    Map = @views.Map
    world = @_.world
    map = world.map
    
    getTile = (x,y) ->
      if map[y]? and map[y][x]? then map[y][x] else {}
    
    (
      (
        tile = getTile(x,y)
        if tile.height < world.seaLevel
          tileType = 'water'
        else if tile.height < 10
          tileType = 'sand'
        else if tile.height < 12
          tileType = 'plain'
        else if tile.height < 14
          tileType = 'hill'
        else
          tileType = 'butte'
          
        Map.ctx.tileFill(x*5,y*5,5,5,tilegfx(tileType))
      ) for x in [0...world.w]     
    ) for y in [0...world.h]
    
    return