define [
  'core/util/autoscroll'
], (Autoscroll) ->
  ->
    views = @views
    
    if views?
      console.log 'autoscroll'
      Autoscroll views.Map

    else
      throw new Error 'views must be set up prior to adding UI'
    
    @
  