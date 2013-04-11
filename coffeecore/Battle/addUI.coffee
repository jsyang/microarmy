define [
  'core/util/autoscroll'
  'core/battle/ui/pawnspawn'
], (Autoscroll, PawnSpawn) ->
  ->
    world = @World
    views = @views

    if views?
      addUIElement(views.Map, world) for addUIElement in [Autoscroll, PawnSpawn]
      
    else
      throw new Error 'views must be set up prior to adding UI'
    
    @
  