define [
  
  'core/util/$'             # Consumed globally.
  'preloader/preloader'     # Consumed globally.
  
  'core/campaign'
  'core/campaign/view/map/terrainAdjust'
  
  'core/battle'
  
], ($, HTML5Preloader, Campaign, drawCampaignMap, Battle) ->

  startGameCampaign = ->
    b = new Campaign({ w: 10, h: 10 })
      .render()
      .addUI()
    drawCampaignMap.apply(b)
      
  window.preloader = HTML5Preloader(startGameCampaign)
  
  #startGameBattle = ->
  #  b = new Battle()
  #    .render()
  #    .addUI()
  
  # window.preloader = HTML5Preloader(startGameBattle)
  
  return
