define(function() {
  return function(el) { var _ = this._;
    el.onclick = function(e){
      var x = (e.pageX * 0.041666667)>>0;
      var y = (e.pageY * 0.041666667)>>0;
      var tile = _.world.map[y][x]
      
      var tileDescription = tile.height < _.world.seaLevel? 'water' : 'land';
      var tileLocation = tile.location? 'has a ' + tile.location.type + ' and' : '';
      
      console.log(tileDescription, 'at', [x, y], tileLocation, 'contains:\n', tile.store.printContents());
    }
  }
});