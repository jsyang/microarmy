/*******************************************************************************
20/04/10 21:41 -- http://jsyang.ca

	gLayer -- each is a <CANVAS>-backed object

	imgs	= array of image filenames to load
	fn	= callback when done loading imgs

	i	= array of HTMLImageElements
	e	= HTMLElement
	c	= DrawingContext
	
*******************************************************************************/
function gLayer(imgs,size,fn){
    this.i=[];
    this.iLoaded=0;
    
    this.callback=fn;
    
    this.checkProgress=function(obj,n){
        if(++obj.iLoaded==n) obj.callback(obj);
    };
    
    
    this.e=document.createElement("canvas");
    if(size!=undefined){
        this.e.width=size[0];
        this.e.height=size[1];
    }
    this.c=this.e.getContext('2d');
    
    document.body.appendChild(this.e);
    
    for(var j in imgs){
        var a=new Image();
        a.src=imgs[j];
        this.i.push(a);				
        a.onerror=function(){ alert("Error in loading "+this.src); };
        if(fn!=undefined) a.onload=this.checkProgress(this,imgs.length);
    }
    
    if(!imgs.length) fn();
}


/*******************************************************************************

	returns max size of the document

*******************************************************************************/
function getDocumentSize(){
        var m=Math.max;
        var db=document.body;
        var de=document.documentElement;
        
        return [
            m(db.scrollWidth,db.offsetWidth,
              de.clientWidth,de.scrollWidth,
              de.offsetWidth),
        
            m(db.scrollHeight,db.offsetHeight,
              de.clientHeight,de.scrollHeight,
              de.offsetHeight)
        ];
}
