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
    
    gfxObj =
      img     : window.preloader1.getFile('heli0')
      imgdx   : 0
      imgdy   : 0
      worldx  : 0
      worldy  : 0
      imgw    : 100
      imgh    : 100
    
    # Testing stuff
    #b.views.Map.ctx.draw gfxObj
    #b.views.Map.ctx.clear()
    
    return
  
  window.preloader1 = preloader(startGame)
  
  return
