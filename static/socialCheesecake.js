window.socialCheesecake = {}

window.socialCheesecake.transformations = {
  changeColor : function(context, color) {
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 4;
    context.stroke();
  }
}

window.socialCheesecake.animations = {
  blurCheesecake : function(cheesecake, sector) {
    var regions= cheesecake.stage.regions;
    regions.splice(0, regions.length);
    regions.push(sector.getOrDrawRegion());
    cheesecake.stage.clear();
    console.log(regions);
  
    for(i in cheesecake.sectors){
      if(cheesecake.sectors[i] != sector){
        var canvas=cheesecake.sectors[i].getOrDrawRegion().getCanvas();
        canvas.parentNode.removeChild(canvas);
        cheesecake.sectors[i].clear();
        //socialCheesecake.transformations.changeColor(cheesecake.sectors[i].getOrDrawRegion().getContext(), "#f5f5f5");
      }
    }
    
  },
  rotateFromTo : function(region, phiOrigion, phiDestination) {

  }
}

window.socialCheesecake.text = {
  writeCurvedText : function(text, context, x, y, r, phi, delta) {
    context.font = "bold 12px sans-serif";
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
  this.sectors = [];
  this.stage = new Kinetic.Stage("container", 800, 600);
  var phi = 0;
  var delta = 2 * Math.PI / jsonSectors.length;
  for(var i = 0; i < jsonSectors.length; i++) {    
    var settings = { parent: this,
                     center: { x: cheesecake.center.x, y: cheesecake.center.y},
                     sector_info: { label: jsonSectors[i], phi: phi, delta: delta, rOut: cheesecake.rMax}
                   };
    console.log("Settings for " + i);
    console.log(settings);
    console.log("Settings for " + i + " end");
    this.sectors[i] = (new socialCheesecake.Sector(settings));
    this.stage.add(this.sectors[i].getOrDrawRegion());
    phi += delta;
  }
}
window.socialCheesecake.Sector = function(settings) {
  if(settings.sector_info.delta <= 0 || settings.sector_info.delta > 2 * Math.PI) {
    throw "Delta must be greater than 0 and less than 2*pi";
  }
  if(settings.sector_info.phi < 0 || settings.sector_info.phi > 2 * Math.PI) {
    throw "Phi must be greater or equal t 0 and less than 2*pi";
  }

  if(settings.parent != null) this.parent = settings.parent;
  
  (settings.center.x !=null) ? this.x=settings.center.x : this.x=0;

  (settings.center.y !=null) ? this.y=settings.center.y : this.y=0;
  
  (settings.sector_info.rOut !=null) ? this.rOut= settings.sector_info.rOut : this.rOut= 300;
  
  (settings.sector_info.rIn !=null) ? this.rIn= settings.sector_info.rIn : this.rIn=0;

  (settings.sector_info.phi !=null) ? this.phi= settings.sector_info.phi : this.phi=0;
  
  (settings.sector_info.delta !=null) ? this.delta= settings.sector_info.delta : this.delta=0;
  
  (settings.sector_info.label.name !=null) ? this.label= settings.sector_info.label.name : this.label=0;
  
  this._region = null;
  
}

window.socialCheesecake.Sector.prototype._draw = function(context) {
  context.save();
  context.beginPath();
  context.arc(this.x, this.y, this.rOut, -this.phi, -(this.phi + this.delta), true);
  context.lineTo(this.x + this.rIn * Math.cos(-this.phi - this.delta), this.y + this.rIn * Math.sin(-this.phi - this.delta));
  context.arc(this.x, this.y, this.rIn, -(this.phi + this.delta), -this.phi, false);
  context.closePath();
  context.fillStyle = "#eeffee";
  context.fill();
  context.lineWidth = 4;
  context.stroke();
  console.log(this);
  socialCheesecake.text.writeCurvedText(this.label, context, this.x, this.y, (this.rOut + this.rIn) / 2, this.phi, this.delta);
}
window.socialCheesecake.Sector.prototype.getOrDrawRegion = function(redraw) {
  if((this._region == null) || (redraw == true)) {
    var sector = this;
    if(sector._region == null) {
      sector._region = new Kinetic.Region(function() {
        var context = this.getContext();
        sector._draw(context);
      });
      console.log("Creada nueva región");
    } else {
      var context = sector._region.getContext();
      context.restore();
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      sector._draw(context);
    }

    
   sector._region.addEventListener('mouseover', function() {
     socialCheesecake.transformations.changeColor(sector._region.getContext(), "#aaffaa");
     sector._region.getContext().restore();
     sector._region.getContext().save();
     socialCheesecake.text.writeCurvedText(sector.label, sector._region.getContext(), sector.x,
                                           sector.y, (sector.rOut+sector.rIn)/2,
                                           sector.phi, sector.delta);
   });
   sector._region.addEventListener('mouseout', function() {
     socialCheesecake.transformations.changeColor(sector._region.getContext(), "#eeffee");
     sector._region.getContext().restore();
     sector._region.getContext().save();
     socialCheesecake.text.writeCurvedText(sector.label, sector._region.getContext(), sector.x,
     sector.y, (sector.rOut+sector.rIn)/2,
     sector.phi, sector.delta);
   });
   sector._region.addEventListener('mousedown', function() {
     socialCheesecake.transformations.changeColor(sector._region.getContext(), "#77ff77");
     sector._region.getContext().restore();
     sector._region.getContext().save();
     socialCheesecake.animations.blurCheesecake(sector.parent, sector);
     socialCheesecake.text.writeCurvedText(sector.label, sector._region.getContext(), sector.x,
                                           sector.y, (sector.rOut+sector.rIn)/2,
                                           sector.phi, sector.delta);
   });
   sector._region.addEventListener('mouseup', function() {
     socialCheesecake.transformations.changeColor(sector._region.getContext(), "#aaffaa");
     sector._region.getContext().restore();
     sector._region.getContext().save();
     socialCheesecake.text.writeCurvedText(sector.label, sector._region.getContext(), sector.x,
     sector.y, (sector.rOut+sector.rIn)/2,
     sector.phi, sector.delta);
   });
     
  }
  return this._region
}
window.socialCheesecake.Sector.prototype.clear = function() {
  var sector=this;
  var context= sector.getOrDrawRegion().getContext();
  if (context!=undefined){
    context.restore();    
  }
  sector.getOrDrawRegion().clear();
}

