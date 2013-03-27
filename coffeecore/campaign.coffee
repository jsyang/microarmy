define [
  'core/Behaviors'
  'core/campaign/behaviors'

  'core/campaign/addCoarseTerrain'
  'core/campaign/addFineTerrain'
  'core/campaign/addLocations'
  'core/campaign/addTransport'
  'core/campaign/addExpansionLocations'
  'core/campaign/addStorage'
  'core/campaign/addResources'
  
  'core/campaign/view/canvasmap'
  #'core/campaign/view/map'
  'core/campaign/view/inventory'
  
  'core/campaign/addUI'
  
], (Behaviors, CampaignBehaviors, CoarseTerrain, FineTerrain, Locations, Transport, ExpandLocations, Storage, Resources, Map, Inventory, addUI) ->
  
  worldBuilders = [
    CoarseTerrain
    FineTerrain
    Locations
    Transport
    #ExpandLocations
    #Storage
    #Resources
  ]
  
  views = {
    Map
    #Inventory
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
      
      @Behaviors = new Behaviors CampaignBehaviors
    
    # GENERATE THE DOM ELEMENTS
    render : ->
      @views = {}
      (
        @views[k] = v(@_.world)
        document.body.appendChild @views[k]
      ) for k,v of views
      @
    
    # UPDATE THE GAMEWORLD FOR 1 CAMPAIGN CYCLE (TURN)
    cycle : ->
      # Process the Behaviors for all the tiles
      # todo: clean up.
      (
        (
          @Behaviors.Execute @Behaviors.Trees.Tile, @_.world.map[y][x]
        ) for x in [0..@_.w-1]
      ) for y in [0..@_.h-1]
      @
      
    # ATTACH USER INTERACTIONS TO THE VIEWS
    addUI : addUI
    