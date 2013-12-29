define ->
  # some stuff to generate sectors so we have specific enough
  # params to use for battle/addTerrain
  
  # DEF:
  # a sector === a campaign map tile.
  # a sequence of sectors composes the battle terrain
  
  makeSector = (i) ->
    sector =
      x         : i
      y         : 5
      height    : $.R(0,15) #i*4
      locations : {}
      road      : $.R(0,1) == 1
      
  sectors = (makeSector(i) for i in [0..4])