define [
  
  'core/util/$'             # Consumed globally.
  'preloader/preloader'     # Consumed globally.
  
  'core/campaign'
  'core/battle'
  
], ($, HTML5Preloader, Campaign, Battle) ->

  startGameCampaign = ->
    b = new Campaign({ w: 30, h: 14 })
      .render()
      .addUI()
    
    window.b = b
    
    
  window.preloader = HTML5Preloader(startGameCampaign)
  
  #startGameBattle = ->
  #  b = new Battle()
  #    .render()
  #    .addUI()
  
  # window.preloader = HTML5Preloader(startGameBattle)
  
  return
