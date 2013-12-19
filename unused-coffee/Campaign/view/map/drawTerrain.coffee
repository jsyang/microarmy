define [
  'core/campaign/view/map/tiles'
] , (tiles) ->  

  gfx8x8 = (type, sub='tile') ->
    [r,c] = tiles['8x8'][type][sub]
    {
      imgdx     : c*8
      imgdy     : r*8
      imgw      : 8
      imgh      : 8
    }
    
  gfxloc = (loc) ->
    [r,c] = $.AR(tiles[loc.size][loc.type])
    size = parseInt(loc.size.split('x')[0])
    {
      imgdx     : c*size
      imgdy     : r*size
      imgw      : size
      imgh      : size
    }
    
  # each map tile is actually 8*5 = 40 pixels squared
  (world)->
    map = world.map
    
    getTile = (x,y) ->
      if map[y]? and map[y][x]? then map[y][x] else {}
    
    tileHeightType = [
      'water'
      'sand'
      'plain'
      'hill'
      'butte'
    ]      
    
    (
      (
        tile = getTile(x,y)
        @tileDraw(x,y,gfx8x8(tileHeightType[tile.height]))

        if tile.road and !tile.location
          N = getTile(  x  , y-1  ).road
          S = getTile(  x  , y+1  ).road
          E = getTile(  x+1, y    ).road
          W = getTile(  x-1, y    ).road
          
          getRoadTile = ->
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
            
          @tileDraw(x,y,gfx8x8('road',getRoadTile()))
          
      ) for x in [0...world.w]     
    ) for y in [0...world.h]
    
    (
      [x,y] = [loc.x, loc.y]
      @tileDraw(x,y,gfxloc(loc), loc.size)
    ) for loc in world.locations
    
    return