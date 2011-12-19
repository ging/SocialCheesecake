var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.text = {writeCurvedText:function(text, context, x, y, r, phi, delta) {
    context.font = "bold 14px sans-serif";
    context.fillStyle = "#000";
    context.textBaseline = "middle";
    var medium_alpha = Math.tan(context.measureText(text).width / (text.length * r));
    if(medium_alpha * text.length <= delta) {
      context.translate(x, y);
      var orientation = 0;
      if(phi + delta / 2 >= Math.PI && phi + delta / 2 < Math.PI * 2) {
        orientation = -1;
        context.rotate(-(delta - medium_alpha * text.length) / 2 - phi - Math.PI / 2)
      }else {
        orientation = 1;
        context.rotate((delta - medium_alpha * text.length) / 2 + Math.PI / 2 - delta - phi)
      }
      for(var i = 0;i < text.length;i++) {
        context.fillText(text[i], 0, -(orientation * r));
        var alpha = Math.tan(context.measureText(text[i]).width / r);
        context.rotate(orientation * alpha)
      }
      return true
    }else {
      return false
    }
  }, writeCenterText:function(text, context, centerX, centerY) {
    context.fillText(text, centerX - context.measureText(text).width / 2, centerY)
  }}
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.Sector = function(settings) {
    var defaultSettings = {center:{x:0, y:0}, rIn:0, rOut:300, delta:Math.PI / 2, phi:0, label:"", color:"#eeffee", mouseover:{color:"#aaffaa"}, mouseout:{color:"#eeffee"}, mouseup:{color:"#77ff77"}, mousedown:{color:"#aaffaa"}};
    for(var property in defaultSettings) {
      if(!(property in settings)) {
        settings[property] = defaultSettings[property]
      }
    }
    if(settings.phi < 0 || settings.phi > 2 * Math.PI) {
      throw"Phi must be greater or equal to 0 and less than 2*pi";
    }
    if(settings.delta <= 0 || settings.delta > 2 * Math.PI) {
      throw"Delta must be greater than 0 and less than 2*pi";
    }
    this.x = settings.center.x;
    this.y = settings.center.y;
    this.rOut = settings.rOut;
    this.rIn = settings.rIn;
    this.phi = settings.phi;
    this.delta = settings.delta;
    this.label = settings.label;
    this.color = settings.color;
    this.mouseover = settings.mouseover;
    this.mouseup = settings.mouseup;
    this.mouseout = settings.mouseout;
    this.mousedown = settings.mousedown;
    this.subsectors = [];
    this.actors = [];
    if(settings.parent != null) {
      this.parent = settings.parent
    }
    if(settings.simulate != null) {
      this.simulate = settings.simulate
    }
    if(settings.subsectors != null) {
      var rInSubsector = this.rIn;
      var separation = (this.rOut - this.rIn) / settings.subsectors.length;
      for(var i in settings.subsectors) {
        var rOutSubsector = rInSubsector + separation;
        var layer = new socialCheesecake.Subsector({label:settings.subsectors[i].name, parent:this, x:this.x, y:this.y, phi:this.phi, delta:this.delta, rIn:rInSubsector, rOut:rOutSubsector, actors:settings.subsectors[i].actors});
        rInSubsector = rOutSubsector;
        this.subsectors.push(layer)
      }
    }
    this.originalAttr = {x:this.x, y:this.y, phi:this.phi, delta:this.delta, rIn:this.rIn, rOut:this.rOut, color:this.color, label:this.label, mouseover:this.mouseover, mouseout:this.mouseout, mousedown:this.mousedown, mouseup:this.mouseup, simulate:this.simulate, subsectors:this.subsectors};
    this._region = null
  };
  socialCheesecake.Sector.prototype._draw = function(context, options) {
    var x = this.x;
    var y = this.y;
    var phi = this.phi;
    var delta = this.delta;
    var rIn = this.rIn;
    var rOut = this.rOut;
    var color = this.color;
    var label = this.label;
    if(options != null) {
      if(options.x != null) {
        x = options.x
      }
      if(options.y != null) {
        y = options.y
      }
      if(options.phi != null) {
        phi = options.phi
      }
      if(options.delta != null) {
        delta = options.delta
      }
      if(options.rIn != null) {
        rIn = options.rIn
      }
      if(options.rOut != null) {
        rOut = options.rOut
      }
      if(options.color != null) {
        color = options.color
      }
      if(options.label != null) {
        label = options.label
      }
    }
    context.restore();
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
    socialCheesecake.text.writeCurvedText(label, context, x, y, (rOut + rIn) / 2, phi, delta)
  };
  socialCheesecake.Sector.prototype.getRegion = function() {
    if(this._region == null) {
      var sector = this;
      sector._region = new Kinetic.Shape(function() {
        var context = this.getContext();
        sector._draw(context)
      });
      sector._region.addEventListener("mouseover", function() {
        sector.eventHandler("mouseover")
      });
      sector._region.addEventListener("mouseout", function() {
        sector.eventHandler("mouseout")
      });
      sector._region.addEventListener("mousedown", function() {
        sector.eventHandler("mousedown")
      });
      sector._region.addEventListener("mouseup", function() {
        sector.eventHandler("mouseup")
      })
    }
    return this._region
  };
  socialCheesecake.Sector.prototype.eventHandler = function(eventName) {
    var sector = this;
    if(sector[eventName] != null) {
      if(sector[eventName].color != null) {
        var color = sector[eventName].color;
        sector.changeColor(color)
      }
      if(sector[eventName].callback != null) {
        sector[eventName].callback(sector)
      }
    }
  };
  socialCheesecake.Sector.prototype.getCheesecake = function() {
    var sector = this;
    return sector.parent
  };
  socialCheesecake.Sector.prototype.splitUp = function() {
    var cheesecake = this.getCheesecake();
    var phi = this.phi;
    var delta = this.delta;
    var rOut = this.rOut;
    var rIn = this.rIn;
    var sector = this.simulate != null ? cheesecake.sectors[this.simulate] : this;
    var subsectors = sector.subsectors;
    var subsectorRIn = rIn;
    var separation = 0;
    if(subsectors.length > 0) {
      separation = (rOut + rIn) / subsectors.length
    }
    for(var i in subsectors) {
      subsectors[i].rIn = rIn;
      subsectors[i].rOut = rIn + separation;
      subsectors[i].phi = phi;
      subsectors[i].delta = delta;
      cheesecake.stage.add(subsectors[i].getRegion());
      rIn += separation
    }
  };
  socialCheesecake.Sector.prototype.putTogether = function() {
    var cheesecake = this.getCheesecake();
    var sector;
    this.simulate != null ? sector = cheesecake.sectors[this.simulate] : sector = this;
    var subsectors = sector.subsectors;
    for(var i in subsectors) {
      cheesecake.stage.remove(subsectors[i].getRegion())
    }
  };
  socialCheesecake.Sector.prototype.changeColor = function(color) {
    var sector = this;
    if(sector.getRegion()) {
      console.log(sector.getRegion());
      var context = sector.getRegion().layer.getContext();
      var stage = sector.getCheesecake().stage;
      sector.color = color;
      context.restore();
      context.save();
      stage.draw()
    }
  };
  socialCheesecake.Sector.prototype.resize = function(options) {
    if(!options) {
      throw"No arguments passed to the function";
    }
    var sector = this;
    var context = sector.getRegion().layer.getContext();
    var stage = sector.getCheesecake().stage;
    var currentDelta = sector.delta;
    var currentPhi = sector.phi;
    var step = 0.05;
    var goalDelta = Math.PI / 2;
    var anchor = 1;
    if(options.step) {
      step = options.step
    }
    if(options.delta) {
      goalDelta = options.delta
    }
    if(options.anchor) {
      if(options.anchor.toLowerCase() == "b" || options.anchor == "beginning") {
        anchor = 0
      }
      if(options.anchor.toLowerCase() == "m" || options.anchor == "middle") {
        anchor = 0.5
      }
      if(options.anchor.toLowerCase() == "e" || options.anchor == "end") {
        anchor = 1
      }
    }
    if(currentDelta > goalDelta) {
      if(currentDelta - goalDelta < step) {
        step = currentDelta - goalDelta
      }
      currentDelta -= step;
      currentPhi += anchor * step
    }else {
      if(currentDelta < goalDelta) {
        if(goalDelta - currentDelta < step) {
          step = goalDelta - currentDelta
        }
        currentDelta += step;
        currentPhi -= anchor * step
      }
    }
    sector.delta = currentDelta;
    sector.phi = currentPhi;
    context.restore();
    context.save();
    stage.draw();
    if(currentDelta != goalDelta) {
      requestAnimFrame(function() {
        sector.resize(options)
      })
    }else {
      if(options.callback) {
        options.callback()
      }
    }
  };
  socialCheesecake.Sector.prototype.focus = function() {
    var sector = this;
    var context = sector.getRegion().layer.getContext();
    var stage = sector.getCheesecake().stage;
    sector.rOut *= 1.05;
    context.restore();
    context.save();
    stage.draw()
  };
  socialCheesecake.Sector.prototype.unfocus = function() {
    var sector = this;
    var context = sector.getRegion().layer.getContext();
    var stage = sector.getCheesecake().stage;
    sector.rOut = sector.originalAttr.rOut;
    context.restore();
    context.save();
    stage.draw()
  };
  socialCheesecake.Sector.prototype.rotateTo = function(options) {
    var sector = this;
    var currentPhi = this.phi;
    var delta = this.delta;
    var step = 0.05;
    var anchor = 0;
    var stage = sector.getCheesecake().stage;
    var context = sector.getRegion().layer.getContext();
    if(!options) {
      throw"No arguments passed to the function";
    }
    if(options.step) {
      step = options.step
    }
    if(options.destination == null) {
      throw"destination must be defined";
    }
    if(options.anchor) {
      if(options.anchor.toLowerCase() == "b" || options.anchor == "beginning") {
        anchor = 0
      }
      if(options.anchor.toLowerCase() == "m" || options.anchor == "middle") {
        anchor = 0.5
      }
      if(options.anchor.toLowerCase() == "e" || options.anchor == "end") {
        anchor = 1
      }
    }
    var phiDestination = (options.destination - anchor * delta) % (2 * Math.PI);
    while(phiDestination < 0) {
      phiDestination += 2 * Math.PI
    }
    var grow = 0;
    if(phiDestination > currentPhi) {
      grow = 1
    }else {
      if(phiDestination < currentPhi) {
        grow = -1
      }
    }
    if(Math.round((2 * Math.PI - Math.abs(phiDestination - currentPhi)) * 1E3) / 1E3 >= Math.round(Math.abs(phiDestination - currentPhi) * 1E3) / 1E3) {
      if(Math.abs(phiDestination - currentPhi) < step) {
        step = Math.abs(phiDestination - currentPhi)
      }
      currentPhi += grow * step
    }else {
      if(2 * Math.PI - Math.abs(phiDestination - currentPhi) < step) {
        step = 2 * Math.PI - Math.abs(phiDestination - currentPhi)
      }
      phiDestination -= grow * 2 * Math.PI;
      currentPhi -= grow * step
    }
    sector.phi = currentPhi;
    context.restore();
    context.save();
    stage.draw();
    if(Math.abs(currentPhi - phiDestination) > 0.001) {
      sector.phi = currentPhi % (2 * Math.PI);
      requestAnimFrame(function() {
        sector.rotateTo({context:context, destination:options.destination, step:step, callback:options.callback, anchor:options.anchor})
      })
    }else {
      if(options.callback) {
        options.callback()
      }
    }
  };
  socialCheesecake.Sector.prototype.addActor = function(actor_info, subsector) {
    var actors = this.actors;
    var actor;
    var actorAlreadyDeclared = false;
    for(var i in actors) {
      if(actors[i].id == actor_info.id) {
        actorAlreadyDeclared = true;
        actor = actors[i];
        var subsectorAlreadyDeclared = false;
        for(var parent in actor.parents) {
          if(actor.parents[parent] == subsector) {
            subsectorAlreadyDeclared = true
          }
        }
        if(!subsectorAlreadyDeclared) {
          actor.parents.push(subsector)
        }
      }
    }
    if(!actorAlreadyDeclared) {
      if(this == subsector) {
        actor = this.parent.addActor(actor_info, subsector)
      }else {
        actor = this.parent.grid.addActor(actor_info, subsector)
      }
      actors.push(actor)
    }
    return actor
  };
  socialCheesecake.Subsector = function(settings) {
    if(settings.parent != null) {
      this.parent = settings.parent
    }
    this.label = "";
    if(settings.label != null) {
      this.label = settings.label
    }
    this.x = settings.x;
    this.y = settings.y;
    this.rOut = settings.rOut;
    this.rIn = settings.rIn;
    this.phi = settings.phi;
    this.delta = settings.delta;
    this.actors = [];
    var grid = this.getCheesecake().grid;
    if(settings.actors) {
      for(var actor in settings.actors) {
        var actor_info = {id:settings.actors[actor][0]};
        this.addActor(actor_info, this)
      }
    }
  };
  socialCheesecake.Subsector.prototype = new socialCheesecake.Sector({parent:this.parent, center:{x:this.x, y:this.y}, label:this.label, rIn:this.rIn, rOut:this.rOut, phi:this.phi, delta:this.delta});
  socialCheesecake.Subsector.prototype.getCheesecake = function() {
    var subsector = this;
    return subsector.parent.parent
  }
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.Grid = function(settings) {
    if(!settings) {
      throw"No arguments passed to the function";
    }
    console.log(settings.actors);
    this.actors = [];
    this.parent = settings.parent;
    this.id = settings.grid_id;
    this.divIdPrefix = settings.divIdPrefix
  };
  socialCheesecake.Grid.prototype.addActor = function(actor_info, subsector) {
    var actors = this.actors;
    var actor;
    var actorAlreadyDeclared = false;
    for(var i in actors) {
      if(actors[i].id == actor_info.id) {
        actorAlreadyDeclared = true;
        actor = actors[i];
        var subsectorAlreadyDeclared = false;
        for(var parent in actor.parents) {
          if(actor.parents[parent] == subsector) {
            subsectorAlreadyDeclared = true
          }
        }
        if(!subsectorAlreadyDeclared) {
          actor.parents.push(subsector)
        }
      }
    }
    if(!actorAlreadyDeclared) {
      actor = new socialCheesecake.Actor({id:actor_info.id, parent:subsector});
      actors.push(actor)
    }
    return actor
  };
  socialCheesecake.Grid.prototype.getActor = function(id) {
    for(var i in actors) {
      if(this.actors[i].id == id) {
        return this.actors[i]
      }
    }
    return null
  };
  socialCheesecake.Grid.prototype.focus = function(actor_ids) {
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        var actor = actor_ids[i];
        if(actor instanceof socialCheesecake.Actor) {
          actor.focus()
        }else {
          this.getActor(actor).focus()
        }
      }
    }else {
      if(actor_ids instanceof socialCheesecake.Actor) {
        actor_ids.focus()
      }else {
        this.getActor(actor_ids).focus()
      }
    }
  };
  socialCheesecake.Grid.prototype.focusAll = function() {
    this.focus(this.actors)
  };
  socialCheesecake.Grid.prototype.hide = function(actor_ids) {
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        var actor = actor_ids[i];
        if(actor instanceof socialCheesecake.Actor) {
          actor.hide()
        }else {
          this.getActor(actor).hide()
        }
      }
    }else {
      if(actor_ids instanceof socialCheesecake.Actor) {
        actor_ids.hide()
      }else {
        this.getActor(actor_ids).hide()
      }
    }
  };
  socialCheesecake.Grid.prototype.hideAll = function() {
    this.hide(this.actors)
  };
  socialCheesecake.Grid.prototype.show = function(actor_ids) {
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        var actor = actor_ids[i];
        if(actor instanceof socialCheesecake.Actor) {
          actor.show()
        }else {
          this.getActor(actor).show()
        }
      }
    }else {
      if(actor_ids instanceof socialCheesecake.Actor) {
        actor_ids.show()
      }else {
        this.getActor(actor_ids).show()
      }
    }
  };
  socialCheesecake.Grid.prototype.showAll = function() {
    this.show(this.actors)
  };
  socialCheesecake.Grid.prototype.unfocus = function(actor_ids) {
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        var actor = actor_ids[i];
        if(actor instanceof socialCheesecake.Actor) {
          actor.unfocus()
        }else {
          this.getActor(actor).unfocus()
        }
      }
    }else {
      if(actor_ids instanceof socialCheesecake.Actor) {
        actor_ids.unfocus()
      }else {
        this.getActor(actor_ids).unfocus()
      }
    }
  };
  socialCheesecake.Grid.prototype.unfocusAll = function() {
    this.unfocus(this.actors)
  }
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.Actor = function(settings) {
    if(!settings) {
      throw"No arguments passed to the function";
    }
    if(!settings.parent) {
      throw"Actor must be associated to at least a subsector";
    }
    var defaultSettings = {};
    for(var property in defaultSettings) {
      if(!(property in settings)) {
        settings[property] = defaultSettings[property]
      }
    }
    this.id = settings.id;
    this.parents = [];
    if(settings.parent) {
      this.parents.push(settings.parent)
    }
    var actor = this;
    var gridIdPrefix = this.getCheesecake().grid.divIdPrefix;
    var actor_div = document.getElementById(gridIdPrefix + this.id);
    var mouseoverCallback = function() {
      var sector;
      actor.focus();
      for(var subsector in actor.parents) {
        sector = actor.parents[subsector].parent;
        sector.eventHandler("mouseover");
        actor.parents[subsector].eventHandler("mouseover")
      }
    };
    var mouseoutCallback = function() {
      var sector;
      actor.unfocus();
      for(var subsector in actor.parents) {
        sector = actor.parents[subsector].parent;
        sector.eventHandler("mouseout");
        actor.parents[subsector].eventHandler("mouseout")
      }
      console.log("mouseout")
    };
    actor_div.addEventListener("mouseover", mouseoverCallback, false);
    actor_div.addEventListener("mouseout", mouseoutCallback, false);
    actor_div.addEventListener("mousedown", function() {
      var sector;
      if(arguments.callee.activeActor) {
        arguments.callee.activeActor = false;
        actor_div.addEventListener("mouseover", mouseoverCallback, false);
        actor_div.addEventListener("mouseout", mouseoutCallback, false)
      }else {
        arguments.callee.activeActor = true;
        actor_div.removeEventListener("mouseover", mouseoverCallback, false);
        actor_div.removeEventListener("mouseout", mouseoutCallback, false)
      }
    })
  };
  socialCheesecake.Actor.prototype.focus = function() {
    var cheesecake = this.getCheesecake();
    var gridIdPrefix = cheesecake.grid.divIdPrefix;
    var actor_id = this.id;
    var actor_div = document.getElementById(gridIdPrefix + actor_id);
    var newClass = "";
    if(actor_div.getAttribute("class")) {
      if(!actor_div.getAttribute("class").match(/\sfocused/)) {
        newClass = actor_div.getAttribute("class").concat(" focused");
        actor_div.setAttribute("class", newClass)
      }
    }else {
      newClass = "focused";
      actor_div.setAttribute("class", newClass)
    }
  };
  socialCheesecake.Actor.prototype.unfocus = function() {
    var cheesecake = this.getCheesecake();
    var gridIdPrefix = cheesecake.grid.divIdPrefix;
    var actor_id = this.id;
    var actor_div = document.getElementById(gridIdPrefix + actor_id);
    var newClass = "";
    if(actor_div.getAttribute("class")) {
      newClass = actor_div.getAttribute("class").replace(/(^|\s)focused($|\s)/, "");
      actor_div.setAttribute("class", newClass)
    }
  };
  socialCheesecake.Actor.prototype.isFocused = function() {
    var cheesecake = this.getCheesecake();
    var gridIdPrefix = cheesecake.grid.divIdPrefix;
    var actor_id = this.id;
    var actor_div = document.getElementById(gridIdPrefix + actor_id);
    var focused = false;
    if(actor_div.getAttribute("class") && actor_div.getAttribute("class").match(/(^|\s)focused($|\s)/)) {
      focused = true
    }
    return focused
  };
  socialCheesecake.Actor.prototype.hide = function() {
    var cheesecake = this.getCheesecake();
    var gridIdPrefix = cheesecake.grid.divIdPrefix;
    var actor_id = this.id;
    var actor_div = document.getElementById(gridIdPrefix + actor_id);
    var newStyle = " display: none;";
    if(actor_div.getAttribute("style")) {
      if(actor_div.getAttribute("style").match(/display\s*:\s*[a-z]*;/)) {
        newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*[a-z]*;/, "display: none;")
      }else {
        newStyle = actor_div.getAttribute("style").concat("display: none;")
      }
    }
    actor_div.setAttribute("style", newStyle)
  };
  socialCheesecake.Actor.prototype.show = function() {
    var cheesecake = this.getCheesecake();
    var gridIdPrefix = cheesecake.grid.divIdPrefix;
    var actor_id = this.id;
    var actor_div = document.getElementById(gridIdPrefix + actor_id);
    if(actor_div.getAttribute("style")) {
      var newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*none;/, "");
      actor_div.setAttribute("style", newStyle)
    }
  };
  socialCheesecake.Actor.prototype.fadeOut = function() {
    var gridIdPrefix = this.getCheesecake().grid.divIdPrefix;
    var actor_id = this.id;
    var actor_div = document.getElementById(gridIdPrefix + actor_id);
    if(actor_div.getAttribute("style")) {
      if(actor_div.getAttribute("style").match(/opacity\s*:\s*[a-zA-Z0-9]*;/)) {
        newStyle = actor_div.getAttribute("style").replace(/opacity\s*:\s*[a-zA-Z0-9]*;/, "opacity: " + 0.5 + ";")
      }else {
        newStyle = actor_div.getAttribute("style").concat("opacity: 1;")
      }
    }
    actor_div.setAttribute("style", newStyle)
  };
  socialCheesecake.Actor.prototype.getCheesecake = function() {
    return this.parents[0].parent.parent
  }
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.Cheesecake = function(cheesecakeData) {
    var jsonSectors = cheesecakeData.sectors;
    var cheesecake = this;
    cheesecake.center = {x:cheesecakeData.center.x, y:cheesecakeData.center.y};
    cheesecake.rMax = cheesecakeData.rMax;
    cheesecake.sectors = [];
    cheesecake.auxiliarSectors = [];
    cheesecake.stage = new Kinetic.Stage(cheesecakeData.container.id, cheesecakeData.container.width, cheesecakeData.container.height);
    cheesecake.grid = new socialCheesecake.Grid({parent:this, grid_id:cheesecakeData.grid.id, divIdPrefix:cheesecakeData.grid.divIdPrefix || "actor_"});
    var phi = 0;
    var delta = 2 * Math.PI / jsonSectors.length;
    var actors = [];
    for(var i = 0;i < jsonSectors.length;i++) {
      var settings = {parent:cheesecake, center:{x:cheesecakeData.center.x, y:cheesecakeData.center.y}, label:jsonSectors[i].name, phi:phi, delta:delta, rOut:cheesecakeData.rMax, subsectors:jsonSectors[i].subsectors, mouseover:{color:"#aaffaa", callback:function(sector) {
        document.body.style.cursor = "pointer";
        cheesecake.grid.hideAll();
        for(var actor in sector.actors) {
          sector.actors[actor].show()
        }
        sector.focus()
      }}, mouseout:{color:"#eeffee", callback:function(sector) {
        document.body.style.cursor = "default";
        cheesecake.grid.showAll();
        sector.unfocus()
      }}, mousedown:{color:"#77ff77", callback:function(sector) {
        cheesecake.focusAndBlurCheesecake(sector);
        cheesecake.grid.hideAll();
        for(var actor in sector.actors) {
          sector.actors[actor].show()
        }
      }}, mouseup:{color:"#aaffaa"}};
      cheesecake.sectors[i] = new socialCheesecake.Sector(settings);
      cheesecake.stage.add(cheesecake.sectors[i].getRegion());
      phi += delta
    }
  };
  socialCheesecake.Cheesecake.prototype.focusAndBlurCheesecake = function(sector) {
    var cheesecake = this;
    var regions = cheesecake.stage.getShapes();
    var sectorIndex;
    for(var i in cheesecake.sectors) {
      if(cheesecake.sectors[i] === sector) {
        sectorIndex = i
      }
    }
    if(sectorIndex == null) {
      throw"sector doesn't belong to this cheesecake";
    }
    for(var i = regions.length - 1;i >= 0;i--) {
      if(!regions[i].permanent) {
        cheesecake.stage.remove(regions[i])
      }
    }
    cheesecake.grid.unfocusAll();
    var greySettings = {parent:cheesecake, center:{x:cheesecake.center.x, y:cheesecake.center.y}, phi:sector.phi + sector.delta, delta:2 * Math.PI - sector.delta, rOut:cheesecake.rMax, mouseout:{color:"#f5f5f5", callback:function() {
      document.body.style.cursor = "default"
    }}, mousedown:{color:"#f5f5f5"}, mouseup:{color:"#f5f5f5"}, mouseover:{color:"#f5f5f5", callback:function() {
      document.body.style.cursor = "pointer"
    }}, color:"#f5f5f5"};
    var dummySettings = {parent:cheesecake, center:{x:cheesecake.center.x, y:cheesecake.center.y}, phi:sector.phi, delta:sector.delta, rOut:sector.rOut, label:sector.label, simulate:sectorIndex, mouseout:{callback:function() {
      document.body.style.cursor = "default"
    }}, mouseover:{callback:function() {
      document.body.style.cursor = "pointer"
    }}};
    var greySector = new socialCheesecake.Sector(greySettings);
    cheesecake.auxiliarSectors.push(greySector);
    var dummySector = new socialCheesecake.Sector(dummySettings);
    cheesecake.auxiliarSectors.push(dummySector);
    cheesecake.stage.add(greySector.getRegion());
    cheesecake.stage.add(dummySector.getRegion());
    var greyMousedownCallback = function() {
      cheesecake.unfocusAndUnblurCheesecake();
      cheesecake.grid.showAll()
    };
    var greyResizeCallback = function() {
      greySector.mousedown.callback = greyMousedownCallback
    };
    var greyRotateToCallback = function() {
      greySector.resize({delta:3 * Math.PI / 2, anchor:"M", callback:greyResizeCallback})
    };
    var dummyResizeCallback = function() {
      dummySector.splitUp()
    };
    var dummyRotateToCallback = function() {
      dummySector.resize({anchor:"M", callback:dummyResizeCallback})
    };
    greySector.rotateTo({destination:5 * Math.PI / 4, callback:greyRotateToCallback, anchor:"M"});
    dummySector.rotateTo({destination:Math.PI / 4, callback:dummyRotateToCallback, anchor:"M"})
  };
  socialCheesecake.Cheesecake.prototype.recoverCheesecake = function() {
    var cheesecake = this;
    var regions = cheesecake.stage.getShapes();
    for(var i = regions.length - 1;i >= 0;i--) {
      if(!regions[i].permanent) {
        cheesecake.stage.remove(regions[i])
      }
    }
    cheesecake.auxiliarSectors.pop();
    for(var i in cheesecake.sectors) {
      cheesecake.stage.add(cheesecake.sectors[i].getRegion())
    }
  };
  socialCheesecake.Cheesecake.prototype.unfocusAndUnblurCheesecake = function() {
    var cheesecake = this;
    var auxiliarSectors = this.auxiliarSectors;
    var sector;
    var greySector;
    for(var i in auxiliarSectors) {
      if(auxiliarSectors[i].simulate != null) {
        sector = auxiliarSectors[i]
      }else {
        greySector = auxiliarSectors[i]
      }
    }
    sector.putTogether();
    sector.resize({anchor:"M", delta:sector.originalAttr.delta, callback:function() {
      sector.rotateTo({destination:sector.originalAttr.phi})
    }});
    greySector.resize({anchor:"M", delta:greySector.originalAttr.delta, callback:function() {
      greySector.rotateTo({destination:greySector.originalAttr.phi, callback:function() {
        cheesecake.recoverCheesecake()
      }})
    }})
  }
})();

