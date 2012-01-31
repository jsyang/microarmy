// Generic generating functions -- procedural terrain, etc.

var Generate={
  
  BG:function(ctx,w,h) {
    var imgData=ctx.createImageData(w,h);
    var d=imgData.data;
    
    var skyGradient=[ // [RGB1, RGB2, ... hex colors]
      ["112111", "acacac"],
      ["442151", "ffac2c"]
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
        d[c+0]=Math.round(cR)+$.R(-3,3);
        d[c+1]=Math.round(cG)+$.R(-3,3);
        d[c+2]=Math.round(cB)+$.R(-3,3);
        d[c+3]=0xFF;
      }
    }
    return imgData;
  },
  
  FG:function(ctx,w,h) {
    // overlay
    var imgData=ctx.getImageData(0,0,w,h);
    var d=imgData.data;
    
    var colors={
      moss:   "7DA774",
      topsoil:"5D3825",
      bedrock:"8498A4"
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
    for(var x=$.R(10,80);x<w;x+=$.R(200,800)) {
      var major={
        x:      x,
        height: $.R(60,h-100)
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
    
    var avgHeight=0;
    for(var i=peaks.length; i--;) avgHeight+=peaks[i].height;
    avgHeight/=peaks.length; avgHeight=Math.round(avgHeight);
    
    // todo: flattening sections in the heightmap... for base layout
    
    var heightmap=[];    
    while (peaks[0].x==0) peaks.shift();
    var current={height:avgHeight, peak:peaks[0]};
    var dy=(current.peak.height-current.height)/current.peak.x;
    for(var x=0, j=0; x<w; x++) {
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
    
    for(var x=0; x<w; x++) {
      for(var height=heightmap[x],shadeMin=0; height<h; height++, shadeMin--) {
        var c=4*((height+1)*w+x);
        var color=colors.bedrock;
        //if(height<$.R(60,80)) color=colors.topsoil;
        //if(height<$.R(10,30)) color=colors.bedrock;
        d[c+0]=color.r+$.R(-8,8)+shadeMin;
        d[c+1]=color.g+$.R(-8,8)+shadeMin;
        d[c+2]=color.b+$.R(-8,8)+shadeMin;
      }
    }
    return {imgdata_:imgData, heightmap_: heightmap, peaks_:peaks};
  }  
};