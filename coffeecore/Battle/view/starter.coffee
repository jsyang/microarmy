define [
  'text!core/Battle/view/templates/starter.html'
], (template) ->

  (world, map, gameplay) ->
    
    # each view is really a set of screens, rather than DOM elements.
    # map is the only one that has any DOM manipulation
    
    if !(world?) or !(map?) or !(gameplay?) then throw new Error 'UI constructor was called with proper args!'
    
    [w, h]  = [ map.ctx.width, map.ctx.height ]
  
    el           = document.createElement 'div'
    el.innerHTML = template

    el