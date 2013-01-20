// View -- render the campaign map
define([],function(){ return function(){ var _ = this._;
    var world = _.world;
    var map = world.map;
    var mapTile = function(x,y) {
      return (map[y] && map[y][x])? map[y][x] : {};
    };

    var roadType = function(x,y) {
      var N = mapTile(x,y-1).road;
      var S = mapTile(x,y+1).road;
      var E = mapTile(x+1,y).road;
      var W = mapTile(x-1,y).road;

      if(N && S && E && W)  { return 'r2';  }
      if(N && S && E &&!W)  { return 'r8';  }
      if(N && S &&!E && W)  { return 'r7';  }
      if(N &&!S && E && W)  { return 'r10'; }
      if(!N &&S && E && W)  { return 'r9';  }
      if(N &&!S && E &&!W)  { return 'r6';  }
      if(!N &&S && E &&!W)  { return 'r5';  }
      if(N &&!S &&!E && W)  { return 'r4';  }
      if(!N&& S &&!E && W)  { return 'r3';  }
      if(!E && !W)          { return 'r0';  }
      if(!N && !S)          { return 'r1';  }

      return 'r'+$.R(0,10);
    };

    var innerHTML = '<div class="map">';

    for(var y=0; y<map.length; y++) {
      for(var x=0; x<map[y].length; x++) {
        innerHTML    += '<span id="mapx'+x+'y'+y+'" ';
        var tile      = map[y][x];
        var tileStyle = '';
        var tileClass = [];

        if(tile.location) {
          tileClass.push(tile.location.type);

        } else if(tile.road) {
          tileClass.push(roadType(tile.x, tile.y));

        } else {
          var shade       = tile.height>15? 15 : tile.height;
          var waterShade  = shade+2;
          var color;
          if(tile.height<world.seaLevel){
            color = waterShade.toString(16)+waterShade.toString(16)+'f';
          } else {
            color = shade.toString(16)+'f'+shade.toString(16);
          }

          tileStyle = 'style="background:#'+color+'"';
        }

        innerHTML += 'class="'+tileClass.join(' ')+'" '+tileStyle+'></span>';
      }
      innerHTML += '<br>';
    }

    innerHTML += '</div>';

    var el = document.createElement('div');
    el.innerHTML = innerHTML;
    return el;
  }

});
