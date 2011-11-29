window.socialCheesecake = {}

window.socialCheesecake.animations = {
  
}

window.socialCheesecake.text = {
  writeCurvedText : function(text, context, x, y, r, phi, delta) {
    context.font = "bold 20px sans-serif";
    context.fillStyle = '#000';
    var medium_alpha = Math.tan(context.measureText(text).width / (text.length * r));
    if(medium_alpha * text.length <= delta) {
      context.translate(x, y);
      var orientation = 0;
      if((phi + delta / 2 >= Math.PI ) && (phi + delta / 2 < Math.PI * 2)) {
        orientation = -1;
        context.rotate(-( delta - (medium_alpha * text.length)) / 2 - phi - Math.PI / 2);
      } else {
        orientation = 1;
        context.rotate(( delta - (medium_alpha * text.length)) / 2 + Math.PI / 2 - delta - phi);
      }
      for(var i = 0; i < text.length; i++) {
        context.fillText(text[i], 0, -(orientation * r));
        var alpha = Math.tan(context.measureText(text[i]).width / r);
        context.rotate(orientation * alpha);
      }
      return true;
    } else {
      return false;
    }
  }
}
window.socialCheesecake.Cheesecake = function(cheesecake) {
  var jsonSectors = cheesecake.sectors;
  
  this.center={x: cheesecake.center.x, y: cheesecake.center.y};
  this.rMax= cheesecake.rMax;
  this.sectors = [];
  this.stage = new Kinetic.Stage("container", 800, 600);
  
  var phi = 0;
  var delta = 2 * Math.PI / jsonSectors.length;
  for(var i = 0; i < jsonSectors.length; i++) {    
    var settings ={ parent: this,
                    center: { x: cheesecake.center.x, y: cheesecake.center.y},
                    sector_info: { label: jsonSectors[i], phi: phi, delta: delta, rOut: cheesecake.rMax,
                                  mouseover: {color: "#aaffaa", callback: function(sector) {sector.focus();}}, 
                                  mouseout: {color: "#eeffee", callback: function(sector) {sector.unfocus();}},
                                  mousedown: {color: "#77ff77", callback: function(sector) {sector.focusAndBlurCheesecake();}}, 
                                  mouseup: {color: "#aaffaa"} }
                   };
    this.sectors[i] = new socialCheesecake.Sector(settings);
    this.stage.add(this.sectors[i].getRegion());
    phi += delta;
  }
  console.log("Sectores creados en el cheesecake");
  console.log(this.sectors);
}
window.socialCheesecake.Sector = function(settings) {

  if(settings.parent != null) this.parent = settings.parent;
  
  if(!settings.center){
    this.x=0;
    this.y=0;
  }else{
    (settings.center.x !=null) ? this.x=settings.center.x : this.x=0;
    (settings.center.y !=null) ? this.y=settings.center.y : this.y=0;
  }
  if(!settings.sector_info){
    this.rOut= 300;
    this.rIn=0;
    this.phi=0;
    this.delta=Math.PI/2;
    this.label="";
    this.color="#eeffee";
    this.mouseover={color : "#aaffaa"};
    this.mouseout={color : "#eeffee"};
    this.mousedown={color : "#77ff77"};
    this.mouseup= {color :"#aaffaa"};
  }else{
    (settings.sector_info.rOut !=null) ? this.rOut= settings.sector_info.rOut : this.rOut= 300; 
    (settings.sector_info.rIn !=null) ? this.rIn= settings.sector_info.rIn : this.rIn=0;
    
    if(!settings.sector_info.delta){
      this.delta=Math.PI/2;
    }else{
      if(settings.sector_info.delta <= 0 || settings.sector_info.delta > 2 * Math.PI) {
        throw "Delta must be greater than 0 and less than 2*pi";
      }
      this.delta= settings.sector_info.delta
    }
    
    if(!settings.sector_info.phi){
      this.phi=0;
    }else{
      if(settings.sector_info.phi < 0 || settings.sector_info.phi > 2 * Math.PI) {
        throw "Phi must be greater or equal to 0 and less than 2*pi";
      }
      this.phi= settings.sector_info.phi
    }

    ((settings.sector_info.label !=null)&&(settings.sector_info.label.name !=null)) ? 
      this.label= settings.sector_info.label.name : this.label="";
    (settings.sector_info.color !=null) ? 
      this.color= settings.sector_info.color : this.color="#eeffee";
     
    if(settings.sector_info.mouseover !=null) this.mouseover= settings.sector_info.mouseover;
    if(settings.sector_info.mouseout !=null) this.mouseout= settings.sector_info.mouseout;
    if(settings.sector_info.mousedown !=null) this.mousedown= settings.sector_info.mousedown;
    if(settings.sector_info.mouseup !=null) this.mouseup= settings.sector_info.mouseup;
  }
  this.originalAttr = { x: this.x, y: this.y, phi: this.phi, delta: this.delta, rIn: this.rIn, 
                        rOut: this.rOut, color: this.color, label: this.label,
                        mouseover: this.mouseover, mouseout: this.mouseout, 
                        mousedown: this.mousedown, mouseup: this.mouseup
                      };
  this._region = null;
}

window.socialCheesecake.Sector.prototype._draw = function(context, options) {
  var x = this.x;
  var y = this.y;
  var phi = this.phi;
  var delta = this.delta;
  var rIn = this.rIn;
  var rOut = this.rOut;
  var color = this.color;
  var label = this.label;
  if(options!=null){
    if(options.x != null) x = options.x;
    if(options.y != null) y = options.y;
    if(options.phi != null) phi = options.phi;
    if(options.delta != null) delta = options.delta;
    if(options.rIn != null) rIn = options.rIn;
    if(options.rOut != null) rOut = options.rOut;
    if(options.color != null) color = options.color;
    if(options.label != null) label = options.label;    
  }
  context.save();
  context.beginPath();
  context.arc(x, y, rOut, -phi, -(phi + delta), true);
  context.lineTo(x + rIn * Math.cos(-phi - delta), y + rIn * Math.sin(-phi - delta));
  context.arc(x, y, rIn, -(phi + delta), -phi, false);
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.lineWidth = 4;
  context.stroke();
  socialCheesecake.text.writeCurvedText(label, context, x, y, (rOut + rIn) / 2, phi, delta);
}
window.socialCheesecake.Sector.prototype.getRegion = function(regenerate) {
  if((this._region == null) || (regenerate == true)) {
    var sector = this;
    if(sector._region != null) {
      /* TO-DO!!!
      if(sector.parent != null){
        var cheesecake=sector.parent;
        var regions= cheesecake.stage.regions;
        var regionIndex;
        for(var j in regions){
          if(regions[j]==sector._region){
            regionIndex= j;
          }
        }
      }
      var canvas=sector.getRegion().getCanvas();
      if((canvas!=null)&&(canvas.parentNode!=null)){
        canvas.parentNode.removeChild(canvas);
      }*/
    }
    sector._region = new Kinetic.Shape(function() {
      var context = this.getContext();
      sector._draw(context);
    });
    /*
    if(regionIndex!=null){
      regions[regionIndex]=this._region;
    } */
    sector._region.addEventListener('mouseover', function() {
      if((sector.mouseover != null) && (sector.mouseover.color != null)){
        var color= sector.mouseover.color;        
        sector.changeColor(color);
      }
      if((sector.mouseover != null) && (sector.mouseover.callback != null)){
        sector.mouseover.callback(sector);
      }
    });
    sector._region.addEventListener('mouseout', function() {
      if((sector.mouseout != null) && (sector.mouseout.color != null)){
        var color= sector.mouseout.color;
        sector.changeColor(color);
      }
      if((sector.mouseout != null) && (sector.mouseout.callback != null)){
        sector.mouseout.callback(sector);
      }
    });
    sector._region.addEventListener('mousedown', function() {
      if((sector.mousedown != null) && (sector.mousedown.color != null)){ 
        var color = sector.mousedown.color;
        sector.changeColor(color);
      }
      if((sector.mousedown != null) && (sector.mousedown.callback != null)){
        sector.mousedown.callback(sector);
      }
    });
    sector._region.addEventListener('mouseup', function() {
      if((sector.mouseup != null) && (sector.mouseup.color != null)){ 
        var color= sector.mouseup.color;
        sector.changeColor(color);
      }
      if((sector.mouseup != null) && (sector.mouseup.callback != null)){
        sector.mouseup.callback(sector);
      }
    });
      
  }
  return this._region
}
window.socialCheesecake.Sector.prototype.changeColor = function(color) {
  var sector= this;
  var context = sector._region.getContext();
  context.fillStyle = color;
  context.fill();
  context.lineWidth = 4;
  context.stroke();
  sector._region.getContext().restore();
  sector._region.getContext().save();
  socialCheesecake.text.writeCurvedText(sector.label, sector._region.getContext(), sector.x,
                                                            sector.y, (sector.rOut+sector.rIn)/2,
                                                            sector.phi, sector.delta);
}

/**
  *
  * Options: delta - new delta to achieve
                  context - sector context to work with
                  step - sets the animation speed
                  anchor - "beginning" , "b"
                               "middle", "m"
                               "end", "e"
  *
**/
window.socialCheesecake.Sector.prototype.resize = function(options) {
  if(!options) throw "No arguments passed to the function";
  if(options.context==null) throw "context must be defined"   
  var context = options.context;
  var sector = this;
  var currentDelta= sector.delta;
  var currentPhi= sector.phi;
  var step = 0.05;
  var goalDelta= Math.PI/2;
  var anchor= 1;
  if(options.step) step = options.step;
  if(options.delta){
    goalDelta= options.delta;
    console.log("Cambiando delta objetivo a "+ goalDelta);
  }
  if(options.anchor){
    if((options.anchor=="b")||(options.anchor=="B")||(options.anchor=="beginning")) anchor= 0;
    if((options.anchor=="m")||(options.anchor=="M")||(options.anchor=="middle")) anchor= 0.5;
    if((options.anchor=="e")||(options.anchor=="E")||(options.anchor=="end")) anchor= 1;   
  }
 	console.log("Entrando en extend");
  console.log("Phi: "+ currentPhi);
  console.log("Delta: "+ currentDelta);
  if(currentDelta>goalDelta){
    if(currentDelta-goalDelta < step){
      currentPhi += anchor*(currentDelta-goalDelta);
      currentDelta-=currentDelta-goalDelta;
    }else{
      currentDelta -= step;
      currentPhi += anchor*step;
    }
  }else if(currentDelta<goalDelta){
    if(goalDelta - currentDelta < step){
      currentPhi -= anchor*(goalDelta - currentDelta);
      currentDelta += goalDelta - currentDelta;     
    }else{
      currentDelta += step;
      currentPhi -= anchor*step;
    }
  }
  
  sector.delta= currentDelta;
  sector.phi= currentPhi;
  
  sector.clear();
  sector._draw(context);
  if(currentDelta!= goalDelta){
    requestAnimFrame(function() {
      sector.resize(options);
    });
  }else{
	console.log("Dejo de ampliar/reducir");
	console.log("Phi definitivo: "+ currentPhi);
  console.log("Delta definitivo: "+ currentDelta);
  }
}
window.socialCheesecake.Sector.prototype.focus = function() {
  var sector= this;
  var context = sector._region.getContext();
  sector.rOut*=1.05;
  sector.clear();
  sector._draw(context);
}
window.socialCheesecake.Sector.prototype.unfocus = function() {
  var sector= this;
  var context = sector._region.getContext();
  sector.rOut= sector.originalAttr.rOut;
  sector.clear();
  sector._draw(context);
}
window.socialCheesecake.Sector.prototype.focusAndBlurCheesecake = function() {
  var sector=this;
  var cheesecake= this.parent;
  var regions= cheesecake.stage.shapes;
  regions.splice(0, regions.length);
  cheesecake.stage.clear();

  for(var i in cheesecake.sectors){
      var canvas=cheesecake.sectors[i].getRegion().getCanvas();
      if(canvas.parentNode!=null){
        canvas.parentNode.removeChild(canvas);
        cheesecake.sectors[i].clear();
      }
  }
  var greySettings ={ parent: cheesecake,
                  center: { x: cheesecake.center.x, y: cheesecake.center.y},
                  sector_info: { phi: sector.phi + sector.delta, delta: 2*Math.PI - sector.delta, 
                                 rOut: cheesecake.rMax,
                                 mouseout: { color:"#f5f5f5"},
                                 mousedown: { color:"#f5f5f5"}, 
                                 mouseup: { color:"#f5f5f5"},
                                 mouseover: {color:"#f5f5f5"},
                                 color: "#f5f5f5"
                               }                                              
                 }; 
  var dummySettings ={ parent: cheesecake,
                  center: { x: cheesecake.center.x, y: cheesecake.center.y},
                  sector_info: { phi: sector.phi, 
                                 delta: sector.delta, 
                                 rOut: sector.rOut, 
                                 color: "#eeffee",
                                 label: {name: sector.label}
                               }                                              
                 }; 
  var greySector = new socialCheesecake.Sector(greySettings);
  var dummySector = new socialCheesecake.Sector(dummySettings);
  cheesecake.stage.add(greySector.getRegion());
  cheesecake.stage.add(dummySector.getRegion());
  var greySectorContext= greySector.getRegion().getContext();
  var dummySectorContext= dummySector.getRegion().getContext();
  greySector.rotateTo({ context: greySectorContext, 
                          phiDestination: Math.PI/2, 
                          callback: function(){greySector.resize({context:greySectorContext, delta: 3*Math.PI/2, anchor:"B" });}
                      });
  dummySector.rotateTo({ context: dummySectorContext, 
                          phiDestination: Math.PI/2 - dummySector.delta,
                          callback: function(){dummySector.resize({context: dummySectorContext, anchor: "E"});}
                      });
}
window.socialCheesecake.Sector.prototype.clear = function() {
  var sector=this;
  var context = sector.getRegion().getContext();
  if (context!=undefined){    
    context.restore();
    context.save();
  }
  sector.getRegion().clear();
}

window.socialCheesecake.Sector.prototype.rotateTo = function(options){
    // update stage
    var sector = this;
    var currentPhi = this.phi;
    var step = 0.05;
    if(!options) throw "No arguments passed to the function";
    if(options.step) step = options.step;
    if(options.context==null) throw "context must be defined";   
    var context = options.context;
    if(options.phiDestination==null) throw "phiDestination must be defined";
    var phiDestination = options.phiDestination
    if((phiDestination < 2*Math.PI)&&(currentPhi > phiDestination)) phiDestination = phiDestination + 2*Math.PI;
    
    currentPhi = currentPhi + step;
    if(currentPhi > phiDestination){
      currentPhi = phiDestination
    }
    sector.phi= currentPhi;
    // clear stage
    sector.clear();

    // draw stage
    this._draw(context);

    // request new frame
    if(currentPhi < phiDestination){
      requestAnimFrame(function() {
        sector.rotateTo({ context: context, 
                                phiDestination: phiDestination, 
                                step: step,  
                                callback: options.callback
                              });
          
      });
    }else{
      if(options.callback) options.callback();
    }
  }