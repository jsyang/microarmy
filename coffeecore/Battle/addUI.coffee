define [
  'core/util/autoscroll'
  'core/battle/ui/pawnspawn'
], (Autoscroll, PawnSpawn) ->
  ->
    world = @World
    views = @views

    if views?
      Autoscroll(views.Map, world)
      
      (
        $.addEvent(handler.context, eventName, handler.func)
      ) for eventName,handler of PawnSpawn(views.Map, world)
      
    else
      throw new Error 'views must be set up prior to adding UI'
    
    @
  