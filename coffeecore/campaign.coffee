define [
  'core/util/$'
  'core/campaign/addTerrain'
  'core/campaign/addLocations'
  'core/campaign/addTransport'
  'core/campaign/addStorage'
  'core/campaign/addResources'
  
  'core/campaign/view/map'
  'core/campaign/view/inventory'
  
  'core/campaign/addUI'
], ($, Terrain, Locations, Transport, Storage, Resources, Map, Inventory, addUI) ->
  
  worldBuilders = [
    Terrain
    Locations
    Transport
    Storage
    Resources
  ]
  
  views = {
    Map
    Inventory
  }
    
  class Campaign
    constructor : (_) ->
      @_ = $.extend {
        w : 36
        h : 24
      }, _
      
      world = @_
      (world = addTo(world)) for addTo in worldBuilders
      
      @_.world = world
    
    render : ->
      @views = {}
      (( @views[k] = v(@_.world) ) for k,v of views)
      @
      
    addUI : addUI
    