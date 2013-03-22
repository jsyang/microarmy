define [
  'core/campaign/view/map/tiles'
] , (tiles) ->  

  tilegfx = (type,sub='tile') ->
    [r,c] = tiles['8x8'][type][sub]
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
        tileType = ([
          'water'
          'sand'
          'plain'
          'hill'
          'butte'
        ])[tile.height]
        
        Map.ctx.tileFill(x*5,y*5,5,5,tilegfx(tileType))
      ) for x in [0...world.w]     
    ) for y in [0...world.h]
    
    return