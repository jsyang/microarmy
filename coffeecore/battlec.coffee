define [
  'core/util/$'
  'core/Behaviors'
  
  'core/Battle/addTerrain'
  
  'core/Battle/view/map'
  
  'core/Battle/addUI'
], ($, Behaviors, Terrain, Map, addUI) ->

  worldBuilders = [
    Terrain
  ]
  
  views = {
    Map
  }
  
  class Battle
    constructor : (_) ->
      @_ = $.extend {
        w: 3200
        h: 480
      }, _
      
      world = @_
      (world = addTo(world)) for addTo in worldBuilders
      @_.world = world
      
      # @Behaviors = new Behaviors BattleBehaviors
      
    render : ->
      @views = {}
      (
        @views[k] = v(@_.world)
        document.body.appendChild @views[k]
      ) for k,v of views
      @
      
    cycle : ->
      # clear / setInterval here.
      return
    
    addUI : addUI
    