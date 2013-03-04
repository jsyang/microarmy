define [
  'core/util/$'
  'core/battle/testSector'
], ($, testSector) ->
  
  # add terrain heightmap to battle world
  (_) ->
    _ = $.extend {
      # todo: take parameters in as sector blocks to generate the terrain instead of random generation
      sectors     : testSector
      sectorWidth : 1024          # 1 sector is this wide
    }, _

    if !_.w? or !_.h?
      throw new Error 'width or height not set!'

    else
      peaks = []    
      (
        # add sector's peaks to peaks
      ) for sector in _.sectors
    
    _