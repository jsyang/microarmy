define [
  'core/Campaign/Storage'
], (Storage) ->
  (_) ->
    tileParams =
      water :
        size      : 0
        decayRate : 40
      land  :
        size      : 1000
        decayRate : 10
      city  :
        size      : 1600
        decayRate : 2
      base  :
        size      : 3000
        decayRate : 0
    
    if _.h? and _.w? and _.map?
      (
        (
          tile = _.map[y][x]
          if tile.location?
            settings = tileParams[tile.location.type]
          else
            settings = if tile.height < _.seaLevel then tileParams.water else tileParams.land
          tile.store = new Storage settings
        ) for x in [0.._.w-1]
      ) for y in [0.._.h-1]
      
      _