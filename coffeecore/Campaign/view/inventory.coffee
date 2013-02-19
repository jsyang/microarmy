# Display a tile's inventory.
define ->
  (world) ->
    
    el           = document.createElement 'div'
    el.innerHTML = 'Select a tile to show its contents'
    el.className = 'map_inventory'
    
    el.show = (tile) ->
      desc = if tile.height < world.seaLevel then 'Water' else 'Land'
      loc  = if tile.location? then "<div class='tile #{tile.location.type}'></div>" else ''
      road = if tile.road then "<div class='tile r2'></div>" else ''
      
      contentsTable = ((
        "<tr><td>#{ qty }</td><td>&#215; #{ resource }</td></tr>"
      ) for resource,qty of tile.store.getContents())
        
      contentsTable = contentsTable.join('')
      
      el.innerHTML = [
        "<h4>#{desc} at (#{ [tile.x, tile.y] })</h4>" 
        "<div>#{road}#{loc}</div><br/>" 
        "<div><table>#{contentsTable}</table></div>"
      ].join('')
        
      return
    
    el
    