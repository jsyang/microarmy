define ->
  # some stuff to generate sectors so we have specific enough
  # params to use for battle/addTerrain
  
  # DEF:
  # a sector === a campaign map tile.
  # a sequence of sectors composes the battle terrain
  
  makeSector = (i) ->
    sector =
      x         : i               # Campaign tile coord
      y         : 5               # Campaign tile coord
      height    : $.R(0,15)       # How high is this battlefield?
      locations : {}              # Contains any special / specific facilities?
      road      : $.R(0,1) == 1   # Does it have a major road on it?
      
  sectors = (makeSector(i) for i in [0..4])