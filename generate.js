// Generic generating functions -- procedural terrain, etc.

var Generate={
  
  TEAM:function(team){
    // Controllers first, then pile the strategic structures in.
    var c=new Commander(team);
    world.addController(c);    
    
    var strength=$.r();    
    var base=[
      // Capital pieces
      {type:SmallTurret, num:$.R(0,1))},
      {type:CommCenter, num:$.R(0,1)},
      {type:MissileRack, num:$.R(0,1)},
      {type:MissileRack, num:$.R(0,1)},
      {type:MissileRack, num:$.R(0,1)},
      {type:CommRelay, num:$.R(0,1)},
      {type:Barracks, num:$.R(1,3)},
      {type:SmallTurret, num:$.R(0,1)},
      {type:Pillbox, num:$.R(0,3)}
    ];
    
    // Prune structures that won't be built.
    for(var b=[],i=0;i<base.length;i++)
      if(base[i].num) b.push(base[i]);
    base=b;
    
    if(team==TEAM.GREEN) {
      var x=world.width-200;
    } else {
      var x=200;
    }
    
    for(var i=0;i<base.length;i++){
      for(;base[i].num>0;base[i].num--) {
        var nextStructure=new (base[i].type)(x,world.getHeight(x),team);
        world.addPawn(nextStructure);
        
        // Add into the structures.
        if(nextStructure instanceof CommCenter || nextStructure instanceof Barracks)
          c._.depot.push(nextStructure);
        
        if(base[i].type==MissileRack &&
           base[i+1] &&
           base[i+1].type==MissileRack &&
           base[i+1].num>0)
          x+=TEAM.GOALDIRECTION[team]*3;
        else
          x+=TEAM.GOALDIRECTION[team]*$.R(36,50);
      }
    }
    
  },
  
  BG:function(ctx,w,h) {
    var imgData=ctx.createImageData(w,h);
    var d=imgData.data;
    
    var skyGradient=[ // [RGB1, RGB2, ... hex colors]
      ["112111", "acacac"],
      ["442151", "ffac2c"],
      ["F2F8F8", "848B9A"]
    ];
    skyGradient=skyGradient[$.R(0,skyGradient.length-1)];
    
    // hard coded with only a 2 color gradient for now
    var rgb1={
      r:parseInt(skyGradient[0].substr(0,2),16),
      g:parseInt(skyGradient[0].substr(2,2),16),
      b:parseInt(skyGradient[0].substr(4,2),16)
    };  
    var rgb2={
      r:parseInt(skyGradient[1].substr(0,2),16),
      g:parseInt(skyGradient[1].substr(2,2),16),
      b:parseInt(skyGradient[1].substr(4,2),16)
    };
    
    // delta RGB, current RGB
    var hInverse=1/h;
    var dR=(rgb2.r-rgb1.r)*hInverse, cR=rgb1.r;
    var dG=(rgb2.g-rgb1.g)*hInverse, cG=rgb1.g;
    var dB=(rgb2.b-rgb1.b)*hInverse, cB=rgb1.b;  
    
    for(var y=0; y<h; y++,cR+=dR,cG+=dG,cB+=dB) {
      for(var x=0; x<w; x++) {
        var c=4*(y*w+x);
        d[c+0]=Math.round(cR);//+$.R(-3,3);
        d[c+1]=Math.round(cG);//+$.R(-3,3);
        d[c+2]=Math.round(cB);//+$.R(-3,3);
        d[c+3]=0xFF;
      }
    }
    return imgData;
  },

  // needs optimization -- very intensive on CPU  
  FG:function(ctx,w,h) {
    // overlay
    var imgData=ctx.getImageData(0,0,w,h);
    var d=imgData.data;
    
    var colors={
      moss:   "7DA774",
      topsoil:"5D3825",
      bedrock:"8498A4",
      steeps: "ADA159",
      sand:   "9F9973"
    };
    for(var i in colors) {
      var j=colors[i];
      colors[i]={
        r:parseInt(j.substr(0,2),16),
        g:parseInt(j.substr(2,2),16),
        b:parseInt(j.substr(4,2),16)
      };
    }
    
    // todo: splines to smooth out the peaks
    
    var peaks=[];
    for(var x=$.R(10,80);x<w;x+=$.R(100,400)) {
      var major={
        x:      x,
        height: $.R(30,h-100)
      };
      for(var j=$.R(1,12); j--;) {
        x+=$.R(24,120);
        var minor={
          x:      x,
          height: major.height+$.R(0,24)
        };
        if(x<w) peaks.push(minor);
      }
      peaks.push(major);
    }
    peaks.sort(function(a,b){return a.x-b.x;});
    
    // insert flat region of 400px at both ends
    // change this later to reflect terrain of the campaign tiles.
    function flatten(p,start,length) {      
      for(var i=0;p[i].x<start;i++);
      for(var j=0;j<p.length-1 && p[j].x<start+length;j++);
      var avgHeight=(p[i].height+p[j].height)>>1;
      p[i].height=avgHeight;
      p[j].height=avgHeight;
      p.splice(i+1,j-i-1);
    }
    
    flatten(peaks,80,400);      // hard coded for now.
    flatten(peaks,w-480,400);
    
    // continued
    var avgHeight=0;
    for(var i=0; i<peaks.length;i++) avgHeight+=peaks[i].height;
    avgHeight/=peaks.length; avgHeight=Math.round(avgHeight);
    
    // todo: flattening sections in the heightmap... for base layout
    
    var heightmap=[];    
    while (peaks[0].x==0) peaks.shift();
    var current={height:avgHeight, peak:peaks[0]};
    for(var x=0, j=0, dy=0; x<w; x++) {
      if(current.peak.x==x) {
        if(++j<peaks.length) {
          current.peak=peaks[j];
          dy=(current.peak.height-current.height)/(current.peak.x-x);
        } else {
          dy=0;          
        }
      }
      heightmap.push(h-Math.round(current.height));
      current.height+=dy;
    }
    
    var color=[colors.bedrock,colors.moss,colors.topsoil,colors.sand,colors.steeps][$.R(0,4)];
    for(var terrainGradient=[], h_=0; h-h_; h_++) {
      terrainGradient.push(color.r-h_);
      terrainGradient.push(color.g-h_);
      terrainGradient.push(color.b-h_);
    }
    
    
    for(var x=0; x<w; x++) {
      for(var height=heightmap[x],i=0; height<h; height++,i++) {
        var c=4*((height+1)*w+x);
        d[c+0]=terrainGradient[3*i+0];
        d[c+1]=terrainGradient[3*i+1];
        d[c+2]=terrainGradient[3*i+2];
      }
    }
    return {imgdata_:imgData, heightmap_: heightmap, peaks_:peaks};
  }  
};