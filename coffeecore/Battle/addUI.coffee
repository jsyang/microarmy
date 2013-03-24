define [
  'core/util/autoscroll'
  'core/battle/ui/clickexplosion'
], (Autoscroll, ClickExplosion) ->
  ->
    world = @_.world
    views = @views

    if views?
      addUIElement(views.Map, world) for addUIElement in [Autoscroll, ClickExplosion]
      
    else
      throw new Error 'views must be set up prior to adding UI'
    
    @
  