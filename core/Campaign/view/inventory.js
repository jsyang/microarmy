// Generated by CoffeeScript 1.4.0

define(function() {
  return function(world) {
    var el;
    el = document.createElement('div');
    el.innerHTML = 'Select a tile to show its contents';
    el.className = 'map_inventory';
    el.show = function(tile) {
      var contentsTable, desc, loc, qty, resource, road;
      desc = tile.height < world.seaLevel ? 'Water' : 'Land';
      loc = tile.location != null ? "<div class='tile " + tile.location.type + "'></div>" : '';
      road = tile.road ? "<div class='tile r2'></div>" : '';
      contentsTable = (function() {
        var _ref, _results;
        _ref = tile.store.getContents();
        _results = [];
        for (resource in _ref) {
          qty = _ref[resource];
          _results.push("<tr><td>" + qty + "</td><td>&#215; " + resource + "</td></tr>");
        }
        return _results;
      })();
      contentsTable = contentsTable.join('');
      el.innerHTML = ["<h4>" + desc + " at (" + [tile.x, tile.y] + ")</h4>", "<div>" + road + loc + "</div><br/>", "<div><table>" + contentsTable + "</table></div>"].join('');
    };
    return el;
  };
});
