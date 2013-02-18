define [
  'core/util/$'
  'core/Campaign/addTerrain'
  'core/Campaign/addLocations'
  'core/Campaign/addTransport'
  'core/Campaign/addStorage'
  'core/Campaign/addResources'
  
  'core/Campaign/MapView'
  'core/campaign/ui'
], ($, Terrain, Locations, Transport, Storage, Resources, MapView, UI) ->
  class Campaign
    constructor : (_) ->
      @_ = $.extend {
        w : 36
        h : 24
      }, _
      
      world = @_
      (world = addTo(world)) for addTo in [
        Terrain
        Locations
        Transport
        Storage
        Resources
      ]
      
      @_.world = world
    
    render : MapView
    ui     : UI
    