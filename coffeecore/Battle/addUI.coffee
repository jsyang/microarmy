define [
  'core/util/autoscroll'
  'core/battle/ui/pawnspawn'
  ''
], (Autoscroll, PawnSpawn) ->
  ->
    world = @World
    views = @views

    if views?
      Autoscroll(views.Map, world)
      
      #todo. make various event handler binds work.
      (
        handler.context
      ) for handler in PawnSpawn
      
    else
      throw new Error 'views must be set up prior to adding UI'
    
    @
  