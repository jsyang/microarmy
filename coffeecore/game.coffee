define [
  'preloader/preloader'
  'core/campaign'
], (preloader, Campaign) ->
  window.preloader = preloader
  
  c = new Campaign
  el = c.render()
  ui = c.ui el
  
  document.body.appendChild el