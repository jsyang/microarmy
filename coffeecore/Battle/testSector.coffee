define [
  'core/util/$'
], ($) ->
  # some stuff to generate sectors so we have specific enough
  # params to use for battle/addTerrain
  
  # DEF:
  # a sector === a campaign map tile.
  
  # a sequence of sectors composes the battle terrain
  
  makeSector = ->
    sector =
      height    : $.R(1,15)
      locations : {}
      road      : $.R(0,1) == 1
      
  sectors = (makeSector for i in [0..4])