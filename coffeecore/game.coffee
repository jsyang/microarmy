define [
  
  'core/util/$'             # Consumed globally.
  'preloader/preloader'     # Consumed globally.
  
  'core/campaign'
  'core/battle'
  
], ($, HTML5Preloader, Campaign, Battle) ->

  tiletype =
    water       : [0,   0]
    waterroadH  : [0,   4]
    waterroadV  : [0,   1]
    waterEdgeE  : [0,   2]
    waterEdgeW  : [6,   2]
    waterEdgeN  : [5,   8]
    waterEdgeS  : [2,   0]
    
    land        : [0,   3]
    
    

  tilegfx = (x,y,type) ->
    [r,c] = tiletype[type]
    {
      img       : preloader.getFile('micropolis')
      imgdx     : c*8
      imgdy     : r*8
      imgw      : 8
      imgh      : 8
      
      worldx    : 8*x
      worldy    : 8*y
      imgw      : 8
      imgh      : 8
    }     
          
  startGameCampaign = ->
    b = new Campaign()#Battle() #Campaign()
      .render()
      .addUI()
  
    window.foo = b
    
    (
      (
        b.views.Map.ctx.draw(tilegfx(x,y,'water'))
      ) for x in [0...10]
    ) for y in [0...10]
    
    (
      b.views.Map.ctx.draw(tilegfx(x,1,'land'))
    ) for x in [0...10]
    
  window.preloader = HTML5Preloader(startGameCampaign)
  
  
  startGameBattle = ->
    b = new Battle()
      .render()
      .addUI()
  
  # window.preloader = HTML5Preloader(startGameBattle)
  
  return
