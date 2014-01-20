define [
  'core/battle/testSector'
], (testSectors) ->
  
  params =
    sectorW           : 1024
    sectorHeightMult  : 18    # height 1 = 24 pixels
    peakMarginMin     : 32
    peakMarginMax     : 128
    peakDev           : 32
    peakMinH          : 16
  
  # Make all the peaks in one sector
  makePeaks = (sector, i) ->
    peaks       = []
    sectorMinX  = i * params.sectorW
    sectorMinH  = (sector.height * params.sectorHeightMult) + params.peakMinH
    x           = $.R(params.peakMarginMin, params.peakMarginMax)
    (
      peaks.push {
        height : sectorMinH + $.R(0, params.peakDev)
        x      : sectorMinX + x
      }
      x += $.R(params.peakMarginMin, params.peakMarginMax)
    ) while x < params.sectorW
    peaks
  
  makeHeightMap = (sectors, battleW, battleH) ->
    h         = sectors[0].height * params.sectorHeightMult + params.peakMinH
    heightmap = []
    peaks     = []
    
    i = 0
    (
      peaks = peaks.concat(makePeaks(sector, i))
      i++
    ) for sector in sectors
    
    x = 0
    (
      dh = (peak.height-h) / (peak.x-x);
      (
        heightmap.push Math.round(battleH-h)
        h += dh
        x++
      ) until x == peak.x
    ) for peak in peaks
    
    if x < battleW
      h = Math.round(h)
      (
        heightmap.push Math.round(battleH-h)
        x++
      ) while x < battleW
    
    heightmap
  
  # add terrain heightmap to battle world
  (world) ->
    if world.w? and world.h?
      world.heightmap = makeHeightMap(testSectors, world.w, world.h)