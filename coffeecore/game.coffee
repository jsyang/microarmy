define [
  'preloader/preloader'
  'core/campaign'
], (preloader, Campaign) ->
  
  window.preloader = preloader
  
  c = new Campaign()
    .render()
    .addUI()
  
  document.body.appendChild v for k,v of c.views
  
  # todo: remove testing code.
  window.foo = c;
  
  return
