define [
  'preloader/preloader'
  'core/campaign'
  'core/battlec'
], (preloader, Campaign, Battle) ->
  
  
  
  #c = new Campaign()
  #  .render()
  #  .addUI()
  
  startGame = ->
    b = new Battle()
      .render()
      .addUI()
    
    # Testing stuff
    #b.views.Map.ctx.draw gfxObj
    #b.views.Map.ctx.clear()
    
    return
  
  window.preloader1 = preloader(startGame)
  
  return
