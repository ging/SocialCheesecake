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
        throw "Phi must be greater or equal t 0 and less than 2*pi";
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
window.socialCheesecake.Sector.prototype.expand = function() {
  var sector = this;
  var delta= sector.delta;
  var phi= sector.phi;
  var context= sector._region.getContext();
  var currentPhi = this.phi;
  var step = 0.05;
  //if(options.step) step = options.step;
  
  if(delta>Math.PI/2){
    if(delta-Math.PI/2 < step){
      delta-=delta-Math.PI/2;
      phi += delta-Math.PI/2;
    }else{
      delta -= step;
      phi += step;
    }
  }
  else if(delta<Math.PI/2){
    if(Math.PI/2 - delta < step){
      delta += Math.PI/2 - delta;
      phi -= Math.PI/2 - delta;
    }
    delta += step;
    phi -= step;
  }
  
  this.delta= delta;
  this.phi= phi;
  
  sector.clear();
  sector._draw(context);
  if(delta!= Math.PI/2){
    requestAnimFrame(function() {
      sector.expand();
    });
  }
}
window.socialCheesecake.Sector.prototype.focus = function() {
  var sector= this;
  var context = sector._region.getContext();
  var options={rOut: sector.rOut*1.05};
  sector.clear();
  sector._draw(context, options);
}
window.socialCheesecake.Sector.prototype.unfocus = function() {
  var sector= this;
  var context = sector._region.getContext();
  sector.clear();
  sector._draw(context);
}
window.socialCheesecake.Sector.prototype.focusAndBlurCheesecake = function() {
  var sector=this;
  var cheesecake= this.parent;
  var regions= cheesecake.stage.shapes;
  regions.splice(0, regions.length);
  //regions.push(sector.getRegion());
  cheesecake.stage.clear();

  for(var i in cheesecake.sectors){
    //if(cheesecake.sectors[i] != sector){
      var canvas=cheesecake.sectors[i].getRegion().getCanvas();
      if(canvas.parentNode!=null){
        canvas.parentNode.removeChild(canvas);
        cheesecake.sectors[i].clear();
      }
    //}
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
                                 rOut: cheesecake.rMax, 
                                 color: "#eeffee",
                                 label: {name: sector.label}
                               }                                              
                 }; 
  var greySector = new socialCheesecake.Sector(greySettings);
  var dummySector = new socialCheesecake.Sector(dummySettings);
  cheesecake.stage.add(greySector.getRegion());
  cheesecake.stage.add(dummySector.getRegion());
  greySector.rotateTo({ context: greySector.getRegion().getContext(), 
                          phiDestination: Math.PI/2, 
                          callback: function(){console.log("Ta Da!")}
                      });
  dummySector.rotateTo({ context: dummySector.getRegion().getContext(), 
                          phiDestination: Math.PI/2 - dummySector.delta,
                          callback: function(){dummySector.expand();}
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
    console.log("Opciones rotate");
    console.log(options);
    // update stage
    var sector = this;
    var currentPhi = this.phi;
    var step = 0.05;
    if(options.step) step = options.step;
    if(options.context==null) throw "context must be defined"   
    var context = options.context;
    var canvas = context.canvas;
    if(options.phiDestination==null) throw "phiDestination must be defined"
    var phiDestination = options.phiDestination
    if((phiDestination < 2*Math.PI)&&(currentPhi > phiDestination)) phiDestination = phiDestination + 2*Math.PI;
    
    currentPhi = currentPhi + step;
    if(currentPhi > phiDestination){
      currentPhi = phiDestination
    }
    sector.phi= currentPhi;
    // clear stage
    context.restore();
    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height);

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