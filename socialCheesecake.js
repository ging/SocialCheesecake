/*
 SocialCheesecake JavaScript Library v0.4.0
 https://github.com/adiezbal/SocialCheesecake
 Developed by Alicia Diez (https://github.com/adiezbal)
 Copyright 2011, Technical University of Madrid (Universidad Politecnica de Madrid)
 Licensed under the MIT or GPL Version 2 licenses.
 Date: Dec 22 2011

 Copyright (C) 2011 by Technical University of Madrid (Universidad Polit?cnica de Madrid)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.Actor = function(settings) {
    if(!settings) {
      throw"No arguments passed to the function";
    }
    if(!settings.parent) {
      throw"Actor must be associated to at least a subsector";
    }
    this.id = settings.id;
    this.name = settings.name;
    this.extraInfo = settings.extraInfo ? settings.extraInfo : undefined;
    this.opacity = socialCheesecake.Grid.maxOpacity;
    this._focused = false;
    this._selected = false;
    this._hidden = true;
    this._filtered = false;
    this.fading = "none";
    this.parents = [];
    if(settings.parent) {
      this.parents.push(settings.parent)
    }
    var actor = this;
    var actor_div = actor.getDiv();
    actor_div.addEventListener("mouseover", function() {
      var sector;
      actor.focus();
      for(var subsector in actor.parents) {
        sector = actor.parents[subsector].parent;
        sector.focus();
        sector.colorHandler("mouseover");
        actor.parents[subsector].colorHandler("mouseover")
      }
    }, false);
    actor_div.addEventListener("mouseout", function() {
      var sector;
      actor.unfocus();
      for(var subsector in actor.parents) {
        sector = actor.parents[subsector].parent;
        sector.unfocus();
        sector.colorHandler("mouseout");
        actor.parents[subsector].colorHandler("mouseout")
      }
    }, false);
    actor_div.addEventListener("click", function() {
      var sector;
      if(actor.isSelected()) {
        actor.unselect()
      }else {
        actor.select();
        actor.unfocus()
      }
    }, false)
  };
  socialCheesecake.Actor.prototype.getParentsIds = function() {
    var parents = this.parents;
    var parentsIds = [];
    for(var i in parents) {
      parentsIds.push(parents[i].id)
    }
    return parentsIds
  };
  socialCheesecake.Actor.prototype.addClass = function(cssClass) {
    var actor_div = this.getDiv();
    var newClass = "";
    var classRegExp = new RegExp("(^|\\s)" + cssClass + "($|\\s)");
    if(actor_div.getAttribute("class")) {
      newClass = actor_div.getAttribute("class");
      if(!newClass.match(classRegExp)) {
        newClass = newClass.concat(" " + cssClass);
        actor_div.setAttribute("class", newClass)
      }
    }else {
      newClass = cssClass;
      actor_div.setAttribute("class", newClass)
    }
  };
  socialCheesecake.Actor.prototype.removeClass = function(cssClass) {
    var actor_div = this.getDiv();
    var newClass = "";
    var classRegExp = new RegExp("(^|\\s)" + cssClass + "($|\\s)");
    if(actor_div.getAttribute("class")) {
      newClass = actor_div.getAttribute("class");
      if(newClass.match(classRegExp)) {
        classRegExp = new RegExp("(^|\\s)" + cssClass);
        newClass = actor_div.getAttribute("class").replace(classRegExp, "");
        actor_div.setAttribute("class", newClass)
      }
    }
  };
  socialCheesecake.Actor.prototype.isSelected = function() {
    return this._selected
  };
  socialCheesecake.Actor.prototype.select = function() {
    this._selected = true;
    this.addClass("selected")
  };
  socialCheesecake.Actor.prototype.unselect = function() {
    this._selected = false;
    this.removeClass("selected")
  };
  socialCheesecake.Actor.prototype.focus = function() {
    this._focused = true;
    this.addClass("focused")
  };
  socialCheesecake.Actor.prototype.unfocus = function() {
    this._focused = false;
    this.removeClass("focused")
  };
  socialCheesecake.Actor.prototype.isFocused = function() {
    var actor = this;
    var gridIdPrefix = this.getCheesecake().grid.divIdPrefix;
    return this._focused
  };
  socialCheesecake.Actor.prototype.hide = function() {
    var actor_div = this.getDiv();
    var newStyle = " display: none;";
    this._hidden = true;
    if(actor_div.getAttribute("style")) {
      if(actor_div.getAttribute("style").match(/display\s*:\s*[a-z]*;/)) {
        newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*[a-z]*;/, "display: none;")
      }else {
        newStyle = actor_div.getAttribute("style").concat("display: none;")
      }
    }
    actor_div.setAttribute("style", newStyle);
    this.fading = "none"
  };
  socialCheesecake.Actor.prototype.show = function() {
    var actor_div = this.getDiv();
    var newStyle = " display: inline;";
    if(this.isFiltered()) {
      return
    }
    this._hidden = false;
    if(actor_div.getAttribute("style")) {
      if(actor_div.getAttribute("style").match(/display\s*:\s*[a-z]*;/)) {
        newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*[a-z]*;/, "display: inline;")
      }else {
        newStyle = actor_div.getAttribute("style").concat("display: inline;")
      }
    }
    actor_div.setAttribute("style", newStyle)
  };
  socialCheesecake.Actor.prototype.isHidden = function() {
    return this._hidden
  };
  socialCheesecake.Actor.prototype.isFiltered = function() {
    return this._filtered
  };
  socialCheesecake.Actor.prototype.isVisible = function() {
    return!(this.isHidden() || this.isFiltered())
  };
  socialCheesecake.Actor.prototype.filter = function() {
    this._filtered = true;
    this.fadeOut(100, true)
  };
  socialCheesecake.Actor.prototype.unfilter = function() {
    this._filtered = false
  };
  socialCheesecake.Actor.prototype.setDivOpacity = function(opacity) {
    opacity = opacity > 1 ? 1 : opacity;
    opacity = opacity < 0 ? 0 : opacity;
    var actor = this;
    var actor_div = this.getDiv();
    this.opacity = opacity;
    var newStyle = "opacity: " + this.opacity + ";";
    if(actor_div.getAttribute("style")) {
      newStyle = actor_div.getAttribute("style").replace(/opacity\s*:\s*[a-zA-Z0-9.]*;/g, "");
      newStyle = newStyle.concat("opacity: " + this.opacity + ";")
    }
    actor_div.setAttribute("style", newStyle)
  };
  socialCheesecake.Actor.prototype.fade = function(time, modifyDisplay) {
    var actor = this;
    var time = time ? time : 300;
    var minOpacity = socialCheesecake.Grid.minOpacity;
    var maxOpacity = socialCheesecake.Grid.maxOpacity;
    var deltaOpacity = (maxOpacity - minOpacity) * 1E3 / (60 * time);
    var grow = 0;
    if(this.fading == "out") {
      grow = -1;
      if(deltaOpacity > this.opacity - minOpacity) {
        deltaOpacity = this.opacity - minOpacity
      }
    }else {
      if(this.fading == "in") {
        grow = 1;
        if(deltaOpacity > maxOpacity - this.opacity) {
          deltaOpacity = maxOpacity - this.opacity
        }
      }
    }
    var opacity = this.opacity + grow * deltaOpacity;
    opacity = Math.round(opacity * 1E3) / 1E3;
    actor.setDivOpacity(opacity);
    if(this.fading == "out" && opacity > minOpacity || this.fading == "in" && opacity < maxOpacity) {
      requestAnimFrame(function() {
        actor.fade(time, modifyDisplay)
      })
    }else {
      this.fading = "none";
      if(modifyDisplay && opacity <= minOpacity) {
        actor.hide()
      }
    }
  };
  socialCheesecake.Actor.prototype.fadeOut = function(time, modifyDisplay) {
    var maxOpacity = socialCheesecake.Grid.maxOpacity;
    this.fading = "out";
    this.setDivOpacity(maxOpacity);
    this.fade(time, modifyDisplay)
  };
  socialCheesecake.Actor.prototype.fadeIn = function(time, modifyDisplay) {
    var actor = this;
    var minOpacity = socialCheesecake.Grid.minOpacity;
    if(actor.isFiltered()) {
      return
    }
    actor.fading = "in";
    actor.setDivOpacity(minOpacity);
    if(modifyDisplay) {
      actor.show()
    }
    actor.fade(time, modifyDisplay)
  };
  socialCheesecake.Actor.prototype.getCheesecake = function() {
    return this.parents[0].parent.parent
  };
  socialCheesecake.Actor.prototype.getDiv = function() {
    var gridIdPrefix = this.getCheesecake().grid.divIdPrefix;
    var actor_id = this.id;
    var actor_div = document.getElementById(gridIdPrefix + actor_id);
    return actor_div
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
    cheesecake.highlightedSector = null;
    cheesecake.onSectorHighlight = cheesecakeData.onSectorHighlight || null;
    cheesecake.onSectorFocusBegin = cheesecakeData.onSectorFocusBegin || null;
    cheesecake.onSectorFocusEnd = cheesecakeData.onSectorFocusEnd || null;
    cheesecake.onSectorUnfocusBegin = cheesecakeData.onSectorUnfocusBegin || null;
    cheesecake.onSectorUnfocusEnd = cheesecakeData.onSectorUnfocusEnd || null;
    cheesecake.syncSectorFocusCallbacks = cheesecake.syncSectorFocusCallbacks || false;
    cheesecake.auxiliarSectors = [];
    cheesecake.stage = new Kinetic.Stage(cheesecakeData.container.id, cheesecakeData.container.width, cheesecakeData.container.height);
    cheesecake.stage.add(new Kinetic.Layer);
    cheesecake.stage.mainLayer = cheesecake.stage.layers[0];
    cheesecake.grid = new socialCheesecake.Grid({parent:this, grid_id:cheesecakeData.grid.id, divIdPrefix:cheesecakeData.grid.divIdPrefix || "actor_", maxOpacity:cheesecakeData.grid.maxOpacity || 1, minOpacity:cheesecakeData.grid.minOpacity || 0});
    cheesecake.searchEngine = new socialCheesecake.SearchEngine({parent:this});
    cheesecake.matchActorsNumber = cheesecakeData.match;
    if(cheesecake.matchActorsNumber == null) {
      cheesecake.matchActorsNumber = true
    }
    cheesecake._initialState = {};
    cheesecake._changes = {};
    cheesecake.onChange = function(cheesecake) {
    };
    if(cheesecakeData.onChange) {
      cheesecake.onChange = cheesecakeData.onChange
    }
    if(cheesecakeData.text) {
      for(var style in cheesecakeData.text) {
        socialCheesecake.text[style] = cheesecakeData.text[style]
      }
    }
    if(cheesecakeData.colors) {
      for(var type in cheesecakeData.colors) {
        for(var color in cheesecakeData.colors[type]) {
          socialCheesecake.colors[type][color] = cheesecakeData.colors[type][color]
        }
      }
    }
    if(jsonSectors.length < 16) {
      var extraSector = new socialCheesecake.Sector({parent:cheesecake, center:cheesecake.center, label:"+", rOut:cheesecakeData.rMax, color:socialCheesecake.colors.extraSector.background, subsectors:[{name:"New Subsector 1"}], auxiliar:true, type:"extraSector"});
      cheesecake.sectors[jsonSectors.length] = extraSector
    }
    var minNumSectors = Math.min(jsonSectors.length, 16);
    for(var i = 0;i < minNumSectors;i++) {
      var settings = {parent:cheesecake, center:cheesecake.center, id:jsonSectors[i].id, label:jsonSectors[i].name, rOut:cheesecakeData.rMax, subsectors:jsonSectors[i].subsectors, type:"normalSector"};
      cheesecake.sectors[i] = new socialCheesecake.Sector(settings)
    }
    cheesecake.calculatePortions();
    cheesecake._setInitialState();
    cheesecake.draw()
  };
  socialCheesecake.Cheesecake.prototype.draw = function() {
    var sectors = this.sectors;
    this.addToLayer(sectors);
    this.stage.draw()
  };
  socialCheesecake.Cheesecake.prototype.disable = function() {
    var layers = this.stage.layers;
    for(var layer in layers) {
      layers[layer].listen(false)
    }
  };
  socialCheesecake.Cheesecake.prototype.enable = function() {
    var layers = this.stage.layers;
    for(var layer in layers) {
      layers[layer].listen(true)
    }
  };
  socialCheesecake.Cheesecake.prototype.focusAndBlurCheesecake = function(sector) {
    var cheesecake = this;
    var sectorIndex;
    for(var i in cheesecake.sectors) {
      if(cheesecake.sectors[i] === sector) {
        sectorIndex = i
      }
    }
    if(sectorIndex == null) {
      throw"sector doesn't belong to this cheesecake";
    }
    cheesecake.clearLayer();
    cheesecake.setHighlightedSector(sector);
    var greySettings = {parent:cheesecake, center:cheesecake.center, phi:sector.phi + sector.delta, delta:2 * Math.PI - sector.delta, rOut:cheesecake.rMax, color:socialCheesecake.colors.greySector.background, auxiliar:true, type:"greySector"};
    var greySector = new socialCheesecake.Sector(greySettings);
    cheesecake.auxiliarSectors.push(greySector);
    var dummySector = this.getAuxiliarClone(sectorIndex);
    cheesecake.addToLayer(greySector);
    cheesecake.addToLayer(dummySector);
    var greyClickCallback = function() {
      greySector.label = "";
      cheesecake.unfocusAndUnblurCheesecake()
    };
    var greyResizeCallback = function() {
      greySector.click = {callback:greyClickCallback};
      greySector.label = "GO BACK"
    };
    var greyRotateToCallback = function() {
      greySector.resizeDelta({delta:3 * Math.PI / 2, anchor:"M", callback:greyResizeCallback})
    };
    var dummyResizeCallback = function() {
      var grid = cheesecake.grid;
      grid.hideAll();
      grid.show(cheesecake.sectors[sectorIndex].actors);
      dummySector.splitUp()
    };
    var dummyRotateToCallback = function() {
      var callback = function() {
        dummySector.resizeDelta({anchor:"M", callback:dummyResizeCallback})
      };
      if(cheesecake.onSectorFocusBegin) {
        if(cheesecake.syncSectorFocusCallbacks) {
          cheesecake.onSectorFocusBegin(cheesecake, callback)
        }else {
          cheesecake.onSectorFocusBegin(cheesecake);
          callback()
        }
      }else {
        callback()
      }
    };
    greySector.rotateTo({destination:5 * Math.PI / 4, callback:greyRotateToCallback, anchor:"M"});
    dummySector.rotateTo({destination:Math.PI / 4, callback:dummyRotateToCallback, anchor:"M"})
  };
  socialCheesecake.Cheesecake.prototype.recoverCheesecake = function() {
    var cheesecake = this;
    var lastSector = this.highlightedSector;
    var mainLayer = this.stage.mainLayer;
    var regions = mainLayer.getShapes();
    cheesecake.removeFromLayer(cheesecake.auxiliarSectors);
    cheesecake.auxiliarSectors = [];
    mainLayer.clear();
    cheesecake.draw();
    if(lastSector) {
      lastSector.color = lastSector.originalAttr.color;
      lastSector.fan(false);
      lastSector.unfocus();
      this.setHighlightedSector(null)
    }
  };
  socialCheesecake.Cheesecake.prototype.unfocusAndUnblurCheesecake = function() {
    var cheesecake = this;
    var auxiliarSectors = this.auxiliarSectors;
    var dummySector;
    var sectorNewDelta;
    var sectorNewPhi;
    var greySector;
    var actions = function() {
      for(var i in auxiliarSectors) {
        if(auxiliarSectors[i].simulate != null) {
          var options = {phi:auxiliarSectors[i].phi, delta:auxiliarSectors[i].delta, rOut:auxiliarSectors[i].rOut};
          dummySector = cheesecake.getAuxiliarClone(auxiliarSectors[i].simulate, options)
        }else {
          greySector = auxiliarSectors[i]
        }
      }
      dummyNewDelta = cheesecake.sectors[dummySector.simulate].delta;
      dummyNewPhi = cheesecake.sectors[dummySector.simulate].phi;
      dummySector.putTogether();
      dummySector.resizeDelta({anchor:"M", delta:dummyNewDelta, callback:function() {
        if(cheesecake.onSectorUnfocusEnd) {
          cheesecake.onSectorUnfocusEnd(cheesecake)
        }
        cheesecake.grid.showAll();
        dummySector.rotateTo({destination:dummyNewPhi})
      }});
      greySector.resizeDelta({anchor:"M", delta:2 * Math.PI - dummyNewDelta, callback:function() {
        greySector.rotateTo({destination:dummyNewPhi + dummyNewDelta, callback:function() {
          cheesecake.recoverCheesecake()
        }})
      }})
    };
    if(cheesecake.onSectorUnfocusBegin) {
      if(cheesecake.syncSectorFocusCallbacks) {
        cheesecake.onSectorUnfocusBegin(cheesecake, actions)
      }else {
        cheesecake.onSectorUnfocusBegin(cheesecake);
        actions()
      }
    }else {
      actions()
    }
  };
  socialCheesecake.Cheesecake.prototype.addNewSector = function() {
    var cheesecake = this;
    var sectors = this.sectors;
    var newSector;
    var settings = {parent:cheesecake, center:cheesecake.center, label:"New Sector", rOut:cheesecake.rMax, subsectors:[{name:"New Subsector 1"}]};
    sectors.push(sectors[sectors.length - 1]);
    newSector = new socialCheesecake.Sector(settings);
    cheesecake.sectors[sectors.length - 2] = newSector;
    cheesecake.calculatePortions()
  };
  socialCheesecake.Cheesecake.prototype.updateActorMembership = function(actor) {
    var changes = this._changes;
    var grid = this.grid;
    var changesInActors;
    var alreadyChanged = false;
    var actorId = actor.id;
    var actorParents = actor.getParentsIds();
    var actorName = actor.name;
    var actorExtraInfo = actor.extraInfo;
    var onChange = this.onChange;
    if(changes.actors != undefined) {
      changesInActors = changes.actors;
      for(var a in changesInActors) {
        if(changesInActors[a].id == actorId) {
          alreadyChanged = true;
          changesInActors[a].subsectors = actorParents
        }
      }
      if(!alreadyChanged) {
        changesInActors.push({id:actorId, subsectors:actorParents, name:actorName, extraInfo:actorExtraInfo, justAdded:false})
      }
    }else {
      changes.actors = [];
      changes.actors.push({id:actorId, subsectors:actorParents, name:actorName, extraInfo:actorExtraInfo, justAdded:false})
    }
    onChange(this)
  };
  socialCheesecake.Cheesecake.prototype.calculatePortions = function() {
    var sectors = this.sectors;
    var match = this.matchActorsNumber;
    var deltaExtra = Math.PI / 8;
    var minDeltaSector = Math.PI / 8;
    var phi = 5 * Math.PI / 4 - deltaExtra / 2;
    var sectorActors = [];
    var sectorPortions = [];
    var totalSectors = sectors.length;
    var totalActors = 0;
    var totalAngle = 2 * Math.PI;
    var unusedAngle;
    if(sectors[sectors.length - 1].auxiliar) {
      sectors[sectors.length - 1].phi = phi;
      sectors[sectors.length - 1].delta = deltaExtra;
      sectors[sectors.length - 1].originalAttr.phi = sectors[sectors.length - 1].phi;
      sectors[sectors.length - 1].originalAttr.delta = sectors[sectors.length - 1].delta;
      phi += deltaExtra;
      totalSectors = sectors.length - 1;
      totalAngle -= deltaExtra
    }
    if(!match) {
      unusedAngle = 0
    }else {
      unusedAngle = totalAngle - totalSectors * minDeltaSector
    }
    for(var i = 0;i < totalSectors;i++) {
      sectorActors[i] = sectors[i].actors.length;
      totalActors += sectorActors[i];
      sectorPortions[i] = minDeltaSector;
      if(!match) {
        sectorPortions[i] = totalAngle / totalSectors
      }
    }
    for(var i = 0;i < totalSectors;i++) {
      if(totalActors != 0) {
        sectorPortions[i] += sectorActors[i] / totalActors * unusedAngle
      }else {
        sectorPortions[i] = totalAngle / totalSectors
      }
      sectors[i].phi = phi;
      sectors[i].delta = sectorPortions[i];
      sectors[i].originalAttr.phi = sectors[i].phi;
      sectors[i].originalAttr.delta = sectors[i].delta;
      phi += sectors[i].delta
    }
  };
  socialCheesecake.Cheesecake.prototype.addToLayer = function(sectors, layer) {
    var layer = layer || this.stage.mainLayer;
    if(sectors instanceof Array) {
      for(var sector in sectors) {
        layer.add(sectors[sector].getRegion())
      }
    }else {
      layer.add(sectors.getRegion())
    }
  };
  socialCheesecake.Cheesecake.prototype.removeFromLayer = function(sectors, layer) {
    var layer = layer || this.stage.mainLayer;
    if(sectors instanceof Array) {
      for(var sector in sectors) {
        try {
          layer.remove(sectors[sector].getRegion())
        }catch(e) {
        }
      }
    }else {
      layer.remove(sectors.getRegion())
    }
  };
  socialCheesecake.Cheesecake.prototype.drawLayer = function(layer) {
    var layer = layer || this.stage.mainLayer;
    layer.draw()
  };
  socialCheesecake.Cheesecake.prototype.clearLayer = function(layer) {
    var layer = layer || this.stage.mainLayer;
    var regions = layer.getShapes();
    for(var i = regions.length - 1;i >= 0;i--) {
      layer.remove(regions[i])
    }
    layer.clear()
  };
  socialCheesecake.Cheesecake.prototype.setHighlightedSector = function(sector) {
    if(this.highlightedSector != sector) {
      this.highlightedSector = sector;
      if(this.onSectorHighlight) {
        this.onSectorHighlight(this)
      }
    }
  };
  socialCheesecake.Cheesecake.prototype.getAuxiliarClone = function(sectorIndex, options) {
    var dummy = null;
    var cheesecake = this;
    var sector = null;
    var auxiliarSectors = cheesecake.auxiliarSectors;
    var settings = {};
    var options = options || {};
    for(var i in auxiliarSectors) {
      if(auxiliarSectors[i].simulate != null) {
        dummy = auxiliarSectors[i]
      }
    }
    if(sectorIndex != null) {
      sector = cheesecake.sectors[sectorIndex];
      settings = {phi:options.phi || sector.phi, delta:options.delta || sector.delta, rOut:options.rOut || sector.rOut, label:options.label || sector.label, borderColor:options.borderColor || socialCheesecake.colors[sector.type]["border"], color:options.color || sector.color, fontColor:options.fontColor || socialCheesecake.colors[sector.type]["font"], simulate:sectorIndex, auxiliar:true, type:"dummySector"};
      if(!dummy) {
        dummy = new socialCheesecake.Sector({center:cheesecake.center, parent:cheesecake});
        this.auxiliarSectors.push(dummy)
      }
      for(var property in settings) {
        dummy[property] = settings[property]
      }
    }
    return dummy
  };
  socialCheesecake.Cheesecake.prototype.getFocusedSector = function() {
    var dummy = this.getAuxiliarClone();
    var sectors = this.sectors;
    var sector = null;
    if(dummy) {
      sector = sectors[dummy.simulate]
    }
    return sector
  };
  socialCheesecake.Cheesecake.prototype.getSectorById = function(id) {
    var sectors = this.sectors;
    var sector;
    for(var i in sectors) {
      if(sectors[i].id == id) {
        sector = sectors[i];
        break
      }
    }
    return sector
  };
  socialCheesecake.Cheesecake.prototype.getSubsectorById = function(id) {
    var sectors = this.sectors;
    var subsectors;
    var subsector;
    for(var i in sectors) {
      subsectors = sectors[i].subsectors;
      for(var j in subsectors) {
        if(subsectors[j].id == id) {
          subsector = subsectors[j];
          break
        }
      }
    }
    return subsector
  };
  socialCheesecake.Cheesecake.prototype.getChanges = function() {
    return this._changes
  };
  socialCheesecake.Cheesecake.prototype.getInitialState = function() {
    return this._initialState
  };
  socialCheesecake.Cheesecake.prototype._setInitialState = function() {
    var state = this._initialState;
    var actors = this.grid.actors;
    state.actors = [];
    for(var actor in actors) {
      state.actors.push({id:actors[actor].id, subsectors:actors[actor].getParentsIds(), name:actors[actor].name, extraInfo:actors[actor].extraInfo})
    }
  }
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.colors = {normalSector:{background:"#FEEEBD", border:"#D19405", font:"#D19405", click:"#FFE481", mouseover:"#FFE481", mouseup:"#FEEEBD", mouseout:"#FEEEBD"}, extraSector:{background:"#FFBABA", border:"#BD1823", font:"#BD1823", click:"#FF5964", mouseover:"#FF5964", mouseup:"#FFBABA", mouseout:"#FFBABA"}, greySector:{background:"#f5f5f5", click:"#f5f5f5", mouseover:"#f5f5f5", mouseout:"#f5f5f5", mouseup:"#f5f5f5", font:"#666", border:"#666"}};
  socialCheesecake.colors.normalSubsector = socialCheesecake.colors.normalSector;
  socialCheesecake.colors.extraSubsector = socialCheesecake.colors.extraSector;
  socialCheesecake.colors.greySubsector = socialCheesecake.colors.greySector
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.eventCallbackHandlers = {normalSector:{mouseover:function(sector) {
    var cheesecake = sector.getCheesecake();
    document.body.style.cursor = "pointer";
    cheesecake.grid.focus(sector.actors);
    sector.focus();
    if(cheesecake.highlightedSector != null) {
      cheesecake.highlightedSector.fan(false, function() {
        sector.fan(true)
      })
    }else {
      sector.fan(true)
    }
    cheesecake.setHighlightedSector(sector)
  }, mouseout:function(sector) {
    var cheesecake = sector.getCheesecake();
    document.body.style.cursor = "default";
    cheesecake.grid.unfocusAll();
    sector.unfocus();
    cheesecake.setHighlightedSector(null);
    sector.fan(false)
  }, click:function(sector) {
    var cheesecake = sector.getCheesecake();
    cheesecake.focusAndBlurCheesecake(sector);
    cheesecake.grid.unfocus(sector.actors)
  }}, extraSector:{mouseover:function(sector) {
    var cheesecake = sector.getCheesecake();
    document.body.style.cursor = "pointer";
    sector.focus()
  }, mouseout:function(sector) {
    var cheesecake = sector.getCheesecake();
    document.body.style.cursor = "default";
    sector.unfocus()
  }, click:function(sector) {
    var cheesecake = sector.getCheesecake();
    cheesecake.focusAndBlurCheesecake(sector);
    cheesecake.addNewSector()
  }}, greySector:{mouseout:function() {
    document.body.style.cursor = "default"
  }, click:function() {
    return
  }, mouseup:function() {
    return
  }, mouseover:function() {
    document.body.style.cursor = "pointer"
  }}, normalSubsector:{mouseover:function(subsector) {
    var cheesecake = subsector.getCheesecake();
    document.body.style.cursor = "pointer";
    if(subsector.parent.subsectors.length < 1) {
      cheesecake.grid.focus(subsector.actors)
    }
    cheesecake.setHighlightedSector(subsector)
  }, mouseout:function(subsector) {
    var cheesecake = subsector.getCheesecake();
    document.body.style.cursor = "default";
    if(subsector.parent.subsectors.length < 1) {
      cheesecake.grid.unfocus(subsector.actors)
    }
    cheesecake.setHighlightedSector(subsector.parent)
  }, click:function(subsector) {
    var cheesecake = subsector.getCheesecake();
    var selectedActors = cheesecake.grid.getSelectedActors();
    if(selectedActors.length > 0) {
      subsector.changeMembership(selectedActors)
    }
  }, mouseup:function() {
    return
  }}, extraSubsector:{mouseover:function(sector) {
    sector.resizeWidth({width:(sector.originalAttr.rOut - sector.originalAttr.rIn) * 1.5, anchor:"m", step:1})
  }, mouseout:function(sector) {
    sector.resizeWidth({width:sector.originalAttr.rOut - sector.originalAttr.rIn, anchor:sector.rIn == 0 ? "rin" : "m", step:1, priority:true})
  }, click:function(subsector) {
    subsector.parent.turnExtraIntoNewSubsector(subsector.simulate)
  }, mouseup:function() {
    return
  }}}
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.Grid = function(settings) {
    if(!settings) {
      throw"No arguments passed to the function";
    }
    this.actors = [];
    this.parent = settings.parent;
    this.id = settings.grid_id;
    this.divIdPrefix = settings.divIdPrefix;
    socialCheesecake.Grid.maxOpacity = settings.maxOpacity;
    socialCheesecake.Grid.minOpacity = settings.minOpacity
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
      actor_info.parent = subsector;
      actor = new socialCheesecake.Actor(actor_info);
      actors.push(actor)
    }
    return actor
  };
  socialCheesecake.Grid.prototype.removeActor = function(actor) {
    var actors = this.actors;
    for(var actorIndex in actors) {
      if(actors[actorIndex].id == actor.id && actor.parents.length <= 0) {
        actors.splice(actorIndex, 1)
      }
    }
  };
  socialCheesecake.Grid.prototype.getActor = function(id) {
    var actors = this.actors;
    for(var i in actors) {
      if(this.actors[i].id == id) {
        return this.actors[i]
      }
    }
    return null
  };
  socialCheesecake.Grid.prototype.getSelectedActors = function() {
    var actors = this.actors;
    var selectedActors = [];
    for(var i in actors) {
      if(actors[i] && actors[i].isSelected()) {
        selectedActors.push(actors[i])
      }
    }
    return selectedActors
  };
  socialCheesecake.Grid.prototype.select = function(actor_ids) {
    var actor;
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        actor = actor_ids[i];
        if(actor) {
          if(!(actor instanceof socialCheesecake.Actor)) {
            actor = this.getActor(actor)
          }
          actor.select()
        }
      }
    }else {
      actor = actor_ids;
      if(!(actor_ids instanceof socialCheesecake.Actor)) {
        actor = this.getActor(actor_ids)
      }
      actor.select()
    }
  };
  socialCheesecake.Grid.prototype.selectAll = function() {
    this.select(this.actors)
  };
  socialCheesecake.Grid.prototype.unselect = function(actor_ids) {
    var actor;
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        actor = actor_ids[i];
        if(actor) {
          if(!(actor instanceof socialCheesecake.Actor)) {
            actor = this.getActor(actor)
          }
          actor.unselect()
        }
      }
    }else {
      actor = actor_ids;
      if(!(actor_ids instanceof socialCheesecake.Actor)) {
        actor = this.getActor(actor_ids)
      }
      actor.unselect()
    }
  };
  socialCheesecake.Grid.prototype.unselectAll = function() {
    this.unselect(this.actors)
  };
  socialCheesecake.Grid.prototype.focus = function(actor_ids) {
    var actor;
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        actor = actor_ids[i];
        if(actor) {
          if(!(actor instanceof socialCheesecake.Actor)) {
            actor = this.getActor(actor)
          }
          actor.focus()
        }
      }
    }else {
      actor = actor_ids;
      if(!(actor_ids instanceof socialCheesecake.Actor)) {
        actor = this.getActor(actor_ids)
      }
      actor.focus()
    }
  };
  socialCheesecake.Grid.prototype.focusAll = function() {
    this.focus(this.actors)
  };
  socialCheesecake.Grid.prototype.hide = function(actor_ids, ignoreSelected) {
    var actor;
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        actor = actor_ids[i];
        if(actor) {
          if(!(actor instanceof socialCheesecake.Actor)) {
            actor = this.getActor(actor)
          }
          if(!actor.isSelected() || ignoreSelected) {
            actor.hide()
          }
        }
      }
    }else {
      if(actor_ids instanceof socialCheesecake.Actor) {
        actor = actor_ids
      }else {
        actor = this.getActor(actor_ids)
      }
      actor.hide()
    }
  };
  socialCheesecake.Grid.prototype.hideAll = function() {
    this.hide(this.actors)
  };
  socialCheesecake.Grid.prototype.show = function(actor_ids, ignoreSelected) {
    var actor;
    if(actor_ids instanceof Array) {
      for(var i = 0;i < actor_ids.length;i++) {
        actor = actor_ids[i];
        if(!(actor instanceof socialCheesecake.Actor)) {
          actor = this.getActor(actor)
        }
        if(!actor.isSelected() || ignoreSelected) {
          actor.show()
        }
      }
    }else {
      if(actor_ids instanceof socialCheesecake.Actor) {
        actor = actor_ids
      }else {
        actor = this.getActor(actor_ids)
      }
      if(!actor.isSelected() || ignoreSelected) {
        actor.show()
      }
    }
  };
  socialCheesecake.Grid.prototype.showAll = function() {
    this.show(this.actors)
  };
  socialCheesecake.Grid.prototype.unfocus = function(actor_ids) {
    var actor;
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        actor = actor_ids[i];
        if(!(actor instanceof socialCheesecake.Actor)) {
          actor = this.getActor(actor)
        }
        actor.unfocus()
      }
    }else {
      actor = actor_ids;
      if(!(actor_ids instanceof socialCheesecake.Actor)) {
        actor = this.getActor(actor_ids)
      }
      actor.unfocus()
    }
  };
  socialCheesecake.Grid.prototype.unfocusAll = function() {
    this.unfocus(this.actors)
  };
  socialCheesecake.Grid.prototype.fadeOut = function(actor_ids, time, modifyDisplay, ignoreSelected) {
    var actor;
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        actor = actor_ids[i];
        if(actor) {
          if(!(actor instanceof socialCheesecake.Actor)) {
            actor = this.getActor(actor)
          }
          if(!actor.isSelected() || ignoreSelected) {
            actor.fadeOut(time, modifyDisplay)
          }
        }
      }
    }else {
      if(actor_ids instanceof socialCheesecake.Actor) {
        actor = actor_ids
      }else {
        actor = this.getActor(actor_ids)
      }
      if(!actor.isSelected() || ignoreSelected) {
        actor.fadeOut(time, modifyDisplay)
      }
    }
  };
  socialCheesecake.Grid.prototype.fadeOutAll = function(time, modifyDisplay) {
    this.fadeOut(this.actors, time, modifyDisplay)
  };
  socialCheesecake.Grid.prototype.fadeIn = function(actor_ids, time, modifyDisplay, ignoreSelected) {
    var actor;
    if(actor_ids instanceof Array) {
      for(var i = 0;i < actor_ids.length;i++) {
        actor = actor_ids[i];
        if(!(actor instanceof socialCheesecake.Actor)) {
          actor = this.getActor(actor)
        }
        if(!actor.isSelected() || ignoreSelected) {
          actor.fadeIn(time, modifyDisplay)
        }
      }
    }else {
      if(actor_ids instanceof socialCheesecake.Actor) {
        actor = actor_ids
      }else {
        actor = this.getActor(actor_ids)
      }
      if(!actor.isSelected() || ignoreSelected) {
        actor.fadeIn(time, modifyDisplay)
      }
    }
  };
  socialCheesecake.Grid.prototype.fadeInAll = function(time, modifyDisplay) {
    this.fadeIn(this.actors, time, modifyDisplay)
  }
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.SearchEngine = function(settings) {
    this.parent = settings.parent
  };
  socialCheesecake.SearchEngine.prototype.filter = function(pattern) {
    var actors = this.parent.grid.actors;
    var patt = new RegExp(pattern.toLowerCase());
    for(var i in actors) {
      var actor = actors[i];
      if(actor.name.toLowerCase().match(patt)) {
        actor.unfilter()
      }else {
        actor.filter()
      }
    }
    if(this.parent.highlightedSector) {
      this.parent.grid.fadeIn(this.parent.highlightedSector.actors, 100, true)
    }else {
      this.parent.grid.fadeIn(this.parent.grid.actors, 100, true)
    }
  }
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.Sector = function(settings) {
    var defaultSettings = {center:{x:0, y:0}, rIn:0, rOut:300, delta:Math.PI / 2, phi:0, label:"", color:socialCheesecake.colors.normalSector.background, auxiliar:false, type:"normalSector"};
    if(!settings) {
      settings = defaultSettings
    }
    for(var property in defaultSettings) {
      if(!(property in settings) || settings[property] === undefined) {
        settings[property] = defaultSettings[property]
      }
    }
    settings.phi %= 2 * Math.PI;
    while(settings.phi < 0) {
      settings.phi += 2 * Math.PI
    }
    if(settings.delta <= 0 || settings.delta > 2 * Math.PI) {
      throw"Delta must be greater than 0 and less than 2*pi";
    }
    if(settings.id) {
      this.id = settings.id
    }
    this.x = settings.center.x;
    this.y = settings.center.y;
    this.rOut = settings.rOut;
    this.rIn = settings.rIn;
    this.phi = settings.phi;
    this.delta = settings.delta;
    this.label = settings.label;
    this.color = settings.color;
    if(settings.fontColor) {
      this.fontColor = settings.fontColor
    }
    if(settings.borderColor) {
      this.borderColor = settings.borderColor
    }
    if(settings.mouseover) {
      this.mouseover = settings.mouseover
    }
    if(settings.mouseup) {
      this.mouseup = settings.mouseup
    }
    if(settings.mouseout) {
      this.mouseout = settings.mouseout
    }
    if(settings.click) {
      this.click = settings.click
    }
    this.subsectors = [];
    this.extraSubsectors = [];
    this.actors = [];
    if(settings.parent != null) {
      this.parent = settings.parent
    }
    if(settings.simulate != null) {
      this.simulate = settings.simulate
    }
    this.auxiliar = settings.auxiliar;
    this.type = settings.type;
    if(settings.subsectors != null) {
      for(var i in settings.subsectors) {
        var subsector = new socialCheesecake.Subsector({id:settings.subsectors[i].id, label:settings.subsectors[i].name, parent:this, x:this.x, y:this.y, phi:null, delta:null, rIn:null, rOut:null, actors:settings.subsectors[i].actors, color:socialCheesecake.colors.normalSector.background});
        this.subsectors.push(subsector)
      }
    }
    this.originalAttr = {x:this.x, y:this.y, phi:this.phi, delta:this.delta, rIn:this.rIn, rOut:this.rOut, color:this.color, label:this.label, simulate:this.simulate, subsectors:this.subsectors, auxiliar:this.auxiliar, type:this.type};
    this._region = null
  };
  socialCheesecake.Sector.prototype._draw = function(context) {
    var x = this.x;
    var y = this.y;
    var phi = this.phi;
    var delta = this.delta;
    var rIn = this.rIn;
    var rOut = this.rOut;
    var color = this.color;
    var label = this.label;
    var actors = this.actors;
    var type = this.type;
    var fontColor = this.fontColor || socialCheesecake.colors[type]["font"];
    context.restore();
    context.save();
    context.beginPath();
    context.arc(x, y, rOut, -phi, -(phi + delta), true);
    context.lineTo(x + rIn * Math.cos(-phi - delta), y + rIn * Math.sin(-phi - delta));
    context.arc(x, y, rIn, -(phi + delta), -phi, false);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = this.borderColor || socialCheesecake.colors[type]["border"];
    context.stroke();
    if(this.auxiliar && label == "+") {
      socialCheesecake.text.addPlusCharacter(context, x, y, 0.5 * (rOut - rIn) + rIn, phi, delta, fontColor)
    }else {
      if(this.parent.auxiliar && this.parent.label == "+") {
        socialCheesecake.text.writeCurvedText(label, context, x, y, 0.7 * (rOut - rIn) + rIn, phi, delta, fontColor, "newStyle")
      }else {
        socialCheesecake.text.writeCurvedText(label, context, x, y, 0.7 * (rOut - rIn) + rIn, phi, delta, fontColor)
      }
    }
    if(!this.auxiliar) {
      socialCheesecake.text.writeCurvedText("(" + actors.length + ")", context, x, y, 0.55 * (rOut - rIn) + rIn, phi, delta, fontColor)
    }
  };
  socialCheesecake.Sector.prototype.getRegion = function() {
    if(this._region == null) {
      var sector = this;
      sector._region = new Kinetic.Shape(function() {
        var context = this.getContext();
        sector._draw(context)
      }, sector.label);
      sector._region.on("mouseover", function() {
        sector.eventHandler("mouseover")
      });
      sector._region.on("mouseout", function() {
        sector.eventHandler("mouseout")
      });
      sector._region.on("click", function() {
        sector.eventHandler("click")
      });
      sector._region.on("mouseup", function() {
        sector.eventHandler("mouseup")
      })
    }
    return this._region
  };
  socialCheesecake.Sector.prototype.eventHandler = function(eventName) {
    this.colorHandler(eventName);
    this.callbackHandler(eventName)
  };
  socialCheesecake.Sector.prototype.colorHandler = function(eventName) {
    var sector = this;
    var type = sector.type;
    if(sector[eventName] != null && sector[eventName].color != null) {
      sector.changeColor(sector[eventName].color)
    }else {
      if(socialCheesecake.colors[type] && socialCheesecake.colors[type][eventName]) {
        sector.changeColor(socialCheesecake.colors[type][eventName])
      }
    }
  };
  socialCheesecake.Sector.prototype.callbackHandler = function(eventName) {
    var sector = this;
    var type = sector.type;
    if(sector[eventName] != null && sector[eventName].callback != null) {
      sector[eventName].callback(sector)
    }else {
      if(socialCheesecake.eventCallbackHandlers[type] && socialCheesecake.eventCallbackHandlers[type][eventName]) {
        socialCheesecake.eventCallbackHandlers[type][eventName](sector)
      }
    }
  };
  socialCheesecake.Sector.prototype.getCheesecake = function() {
    return this.parent
  };
  socialCheesecake.Sector.prototype.turnExtraIntoNewSubsector = function(subsectorIndex) {
    var sector = this;
    var cheesecake = this.getCheesecake();
    var allSubsectors = this.extraSubsectors.concat(this.subsectors);
    var dummyNormal = [];
    var dummyExtra = [];
    var step = 1.5;
    var mainExtraAnchor = "m";
    for(var i in allSubsectors) {
      var settings = {label:allSubsectors[i].label, x:allSubsectors[i].x, y:allSubsectors[i].y, rIn:allSubsectors[i].rIn, rOut:allSubsectors[i].rOut, phi:allSubsectors[i].phi, delta:allSubsectors[i].delta, type:allSubsectors[i].type, auxiliar:allSubsectors[i].auxiliar || null, parent:allSubsectors[i].parent, color:allSubsectors[i].color};
      if(i < this.extraSubsectors.length) {
        dummyExtra.push(new socialCheesecake.Subsector(settings));
        dummyExtra[i].listen(false)
      }else {
        dummyNormal.push(new socialCheesecake.Subsector(settings));
        dummyNormal[i - dummyExtra.length].listen(false)
      }
    }
    cheesecake.addToLayer(dummyNormal.concat(dummyExtra));
    cheesecake.removeFromLayer(allSubsectors);
    this.addNewSubsector(subsectorIndex);
    var normalSubsectors = this.subsectors;
    this.extraSubsectors = [];
    var extraSubsectors = sector.extraSubsectors;
    var clone = this.getCheesecake().getAuxiliarClone();
    clone.calculateSubportions();
    clone.label = "";
    for(var i in dummyExtra) {
      if(i != subsectorIndex) {
        dummyExtra[i].resizeWidth({width:0, anchor:"m", step:step})
      }
    }
    var dummyNormalResizeCallback = function() {
      for(var i = 0;i < dummyNormal.length;i++) {
        dummyNormal[i].changeMediumRadius({radius:i < subsectorIndex ? normalSubsectors[i].getMediumRadius() : normalSubsectors[i + 1].getMediumRadius(), step:step})
      }
      dummyExtra[subsectorIndex].type = "normalSubsector";
      dummyExtra[subsectorIndex].color = normalSubsectors[subsectorIndex].color;
      dummyExtra[subsectorIndex].label = "";
      if(subsectorIndex == 0) {
        mainExtraAnchor = "rin"
      }else {
        if(subsectorIndex == dummyExtra.length - 1) {
          mainExtraAnchor = "rout"
        }
      }
      dummyExtra[subsectorIndex].resizeWidth({width:mainExtraAnchor == "m" || extraSubsectors.length == 0 ? normalSubsectors[subsectorIndex].getWidth() : extraSubsectors[subsectorIndex].getWidth() + normalSubsectors[subsectorIndex].getWidth(), anchor:mainExtraAnchor, step:step, callback:mainDummyExtraCallback})
    };
    var mainDummyExtraCallback = function() {
      dummyExtra[subsectorIndex].label = normalSubsectors[subsectorIndex].label;
      dummyExtra[subsectorIndex].changeMediumRadius({radius:normalSubsectors[subsectorIndex].getMediumRadius(), step:step, callback:normalSubsectors.length >= 4 ? finalAnimationCallback : function() {
        return
      }});
      if(normalSubsectors.length < 4) {
        sector.createExtraSubsectors();
        clone.calculateSubportions();
        extraSubsectors = sector.extraSubsectors;
        var settings = {label:"+", x:extraSubsectors[subsectorIndex].x, y:extraSubsectors[subsectorIndex].y, phi:dummyExtra[subsectorIndex].phi, delta:dummyExtra[subsectorIndex].delta, type:"extraSubsector", auxiliar:true, parent:dummyExtra[subsectorIndex].parent, color:extraSubsectors[subsectorIndex].color};
        dummyExtra.push(new socialCheesecake.Subsector(settings));
        dummyExtra.push(new socialCheesecake.Subsector(settings));
        for(var i = 0;i < dummyExtra.length;i++) {
          var done = false;
          if(i != subsectorIndex) {
            dummyExtra[i].rIn = i < subsectorIndex ? extraSubsectors[i].getMediumRadius() : extraSubsectors[i - 1].getMediumRadius();
            dummyExtra[i].rOut = dummyExtra[i].rIn;
            cheesecake.addToLayer(dummyExtra[i]);
            dummyExtra[i].resizeWidth({width:i < subsectorIndex ? extraSubsectors[i].getWidth() : extraSubsectors[i - 1].getWidth(), anchor:"m", step:step, callback:!done ? function() {
              finalAnimationCallback();
              done = true
            } : function() {
              return
            }})
          }
        }
      }
    };
    var finalAnimationCallback = function() {
      cheesecake.removeFromLayer(dummyNormal.concat(dummyExtra));
      cheesecake.addToLayer(normalSubsectors);
      if(extraSubsectors) {
        cheesecake.addToLayer(extraSubsectors)
      }
      cheesecake.drawLayer()
    };
    for(var i = 0;i < dummyNormal.length;i++) {
      dummyNormal[i].resizeWidth({width:i < subsectorIndex ? normalSubsectors[i].getWidth() : normalSubsectors[i + 1].getWidth(), anchor:"m", step:step, callback:i == 0 ? dummyNormalResizeCallback : function() {
        return
      }})
    }
  };
  socialCheesecake.Sector.prototype.splitUp = function() {
    var cheesecake = this.getCheesecake();
    var callback = cheesecake.onSectorFocusEnd;
    var sector = this.simulate != null ? cheesecake.sectors[this.simulate] : this;
    var subsectors = sector.subsectors;
    if(subsectors.length < 4) {
      sector.createExtraSubsectors()
    }
    this.calculateSubportions();
    cheesecake.addToLayer(subsectors.concat(sector.extraSubsectors));
    cheesecake.drawLayer();
    if(callback) {
      callback(cheesecake)
    }
  };
  socialCheesecake.Sector.prototype.putTogether = function() {
    var cheesecake = this.getCheesecake();
    var layer = null;
    var sector = this.simulate != null ? cheesecake.sectors[this.simulate] : this;
    var subsectors = sector.subsectors;
    var extraSubsectors = sector.extraSubsectors;
    cheesecake.removeFromLayer(subsectors.concat(extraSubsectors));
    sector.extraSubsectors = []
  };
  socialCheesecake.Sector.prototype.createExtraSubsectors = function() {
    var cheesecake = this.getCheesecake();
    var sector = this;
    var subsectors = this.subsectors;
    var extraSubsectors = this.extraSubsectors || [];
    var extraSettings = {x:cheesecake.center.x, y:cheesecake.center.y, label:"+", parent:sector, auxiliar:true, color:socialCheesecake.colors.extraSector.background, type:"extraSubsector"};
    extraSubsectors.splice(0, extraSubsectors.length);
    for(var i = 0;i < subsectors.length + 1;i++) {
      extraSettings["simulate"] = i;
      var extraSector = new socialCheesecake.Subsector(extraSettings);
      extraSubsectors.push(extraSector)
    }
  };
  socialCheesecake.Sector.prototype.calculateSubportions = function() {
    var cheesecake = this.getCheesecake();
    var sector = this.simulate != null ? cheesecake.sectors[this.simulate] : this;
    var subsectors = sector.subsectors;
    var extraSubsectors = sector.extraSubsectors;
    var phi = this.phi;
    var delta = this.delta;
    var rOut = this.rOut;
    var rIn = this.rIn;
    var extraWidth = extraSubsectors.length == subsectors.length + 1 ? (rOut - rIn) * 0.06 : 0;
    var sectorWidth = (rOut - rIn - extraSubsectors.length * extraWidth) / subsectors.length;
    for(var i in subsectors) {
      rIn += extraWidth;
      subsectors[i].rIn = rIn;
      subsectors[i].originalAttr.rIn = subsectors[i].rIn;
      subsectors[i].rOut = rIn + sectorWidth;
      subsectors[i].originalAttr.rOut = subsectors[i].rOut;
      subsectors[i].phi = phi;
      subsectors[i].originalAttr.phi = subsectors[i].phi;
      subsectors[i].delta = delta;
      subsectors[i].originalAttr.delta = subsectors[i].delta;
      rIn += sectorWidth
    }
    rIn = this.rIn;
    for(var i in extraSubsectors) {
      extraSubsectors[i].rIn = rIn;
      extraSubsectors[i].originalAttr.rIn = extraSubsectors[i].rIn;
      extraSubsectors[i].rOut = rIn + extraWidth;
      extraSubsectors[i].originalAttr.rOut = extraSubsectors[i].rOut;
      extraSubsectors[i].delta = delta;
      extraSubsectors[i].originalAttr.delta = extraSubsectors[i].delta;
      extraSubsectors[i].phi = phi;
      extraSubsectors[i].originalAttr.phi = extraSubsectors[i].phi;
      rIn += extraWidth + sectorWidth
    }
  };
  socialCheesecake.Sector.prototype.changeColor = function(color) {
    this.changeProperty("color", color)
  };
  socialCheesecake.Sector.prototype.changeLabel = function(label) {
    this.changeProperty("label", label)
  };
  socialCheesecake.Sector.prototype.changeProperty = function(name, value) {
    var sector = this;
    var stage = sector.getCheesecake().stage;
    var context = stage.mainLayer.getContext();
    sector[name] = value;
    context.restore();
    context.save();
    stage.draw()
  };
  socialCheesecake.Sector.prototype.resizeDelta = function(options) {
    if(!options) {
      throw"No arguments passed to the function";
    }
    var sector = this;
    var stage = sector.getCheesecake().stage;
    var context = stage.mainLayer.getContext();
    var currentDelta = sector.delta;
    var currentPhi = sector.phi;
    var step = 0.05;
    var goalDelta = Math.PI / 2;
    var anchor = 1;
    var goOn = true;
    var grow = 0;
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
      currentPhi += anchor * step;
      grow = -1
    }else {
      if(currentDelta < goalDelta) {
        if(goalDelta - currentDelta < step) {
          step = goalDelta - currentDelta
        }
        currentDelta += step;
        currentPhi -= anchor * step;
        grow = 1
      }
    }
    if(options.priority) {
      sector.growDelta = grow
    }
    if(sector.growDelta != null && grow != sector.growDelta) {
      goOn = false
    }else {
      goOn = true;
      sector.growDelta = grow
    }
    sector.delta = currentDelta;
    sector.phi = currentPhi;
    context.restore();
    context.save();
    stage.draw();
    if(goOn && Math.round(currentDelta * 1E3) != Math.round(goalDelta * 1E3)) {
      requestAnimFrame(function() {
        sector.resizeDelta(options)
      })
    }else {
      sector.growDelta = null;
      if(options.callback) {
        options.callback()
      }
    }
  };
  socialCheesecake.Sector.prototype.resizeWidth = function(options) {
    var sector = this;
    var stage = sector.getCheesecake().stage;
    var context = stage.mainLayer.getContext();
    var currentRIn = this.rIn;
    var currentROut = this.rOut;
    var currentWidth = currentROut - currentRIn;
    var step = 0.05;
    var goalWidth = currentWidth;
    var anchor = 1;
    var grow = 0;
    var goOn = true;
    if(options.step) {
      step = options.step
    }
    if(options.width != null) {
      goalWidth = options.width
    }
    if(goalWidth < 0) {
      throw"Width must be greater than or equal to zero";
    }
    if(options.anchor) {
      if(options.anchor.toLowerCase() == "i" || options.anchor == "in" || options.anchor.toLowerCase() == "rin") {
        anchor = 1
      }
      if(options.anchor.toLowerCase() == "m" || options.anchor == "middle") {
        anchor = 0.5
      }
      if(options.anchor.toLowerCase() == "o" || options.anchor == "out" || options.anchor.toLowerCase() == "rout") {
        anchor = 0
      }
    }
    if(currentWidth > goalWidth) {
      if(currentWidth - goalWidth < step) {
        step = currentWidth - goalWidth
      }
      grow = -1
    }else {
      if(currentWidth < goalWidth) {
        if(goalWidth - currentWidth < step) {
          step = goalWidth - currentWidth
        }
        grow = 1
      }
    }
    if(options.priority) {
      sector.grow = grow
    }
    if(sector.grow != null && grow != sector.grow) {
      goOn = false
    }else {
      goOn = true;
      sector.grow = grow
    }
    currentROut = currentROut + grow * anchor * step;
    currentRIn = currentRIn - grow * (1 - anchor) * step;
    currentWidth = currentROut - currentRIn;
    if(currentRIn < 0) {
      currentROut += this.rIn - currentRIn;
      currentRIn = 0
    }
    if(currentWidth <= 0) {
      sector.getCheesecake().removeFromLayer(sector)
    }
    sector.rOut = currentROut;
    sector.rIn = currentRIn;
    context.restore();
    context.save();
    stage.draw();
    if(goOn && Math.round(currentWidth * 1E3) != Math.round(goalWidth * 1E3)) {
      requestAnimFrame(function() {
        sector.resizeWidth(options)
      })
    }else {
      sector.grow = null;
      if(options.callback) {
        options.callback()
      }
    }
  };
  socialCheesecake.Sector.prototype.changeMediumRadius = function(options) {
    var sector = this;
    var currentRIn = this.rIn;
    var currentROut = this.rOut;
    var currentMedRad = this.getMediumRadius();
    if(options.radius - this.getWidth() / 2 < 0) {
      options.radius = this.getWidth() / 2
    }
    var goalMedRad = options.radius || currentMedRad;
    var step = options.step || 0.05;
    var context = this.getCheesecake().stage.mainLayer.getContext();
    if(goalMedRad > currentMedRad) {
      if(goalMedRad - currentMedRad < step) {
        step = goalMedRad - currentMedRad
      }
      currentRIn += step;
      currentROut += step
    }else {
      if(currentMedRad - goalMedRad < step) {
        step = currentMedRad - goalMedRad
      }
      currentRIn -= step;
      currentROut -= step
    }
    this.rIn = Math.round(currentRIn * 1E3) / 1E3;
    this.rOut = Math.round(currentROut * 1E3) / 1E3;
    currentMedRad = this.getMediumRadius();
    context.restore();
    context.save();
    this.getCheesecake().stage.draw();
    if(Math.round(currentMedRad * 1E3) != Math.round(goalMedRad * 1E3)) {
      requestAnimFrame(function() {
        sector.changeMediumRadius(options)
      })
    }else {
      if(options.callback) {
        options.callback()
      }
    }
  };
  socialCheesecake.Sector.prototype.focus = function() {
    var sector = this;
    var stage = sector.getCheesecake().stage;
    var context = stage.mainLayer.getContext();
    sector.rOut = sector.originalAttr.rOut * 1.05;
    context.restore();
    context.save();
    stage.draw()
  };
  socialCheesecake.Sector.prototype.unfocus = function() {
    var sector = this;
    var stage = sector.getCheesecake().stage;
    var context = stage.mainLayer.getContext();
    sector.rOut = sector.originalAttr.rOut;
    context.restore();
    context.save();
    stage.draw()
  };
  socialCheesecake.Sector.prototype.fan = function(open, resizeDeltaCallback) {
    var sector = this;
    var minDelta = Math.PI / 5;
    if(open && sector.delta >= minDelta) {
      return
    }
    if(open) {
      sector.getRegion().moveToTop();
      sector.resizeDelta({anchor:"m", delta:minDelta, callback:resizeDeltaCallback})
    }else {
      sector.resizeDelta({anchor:"m", delta:sector.originalAttr.delta, priority:true, callback:resizeDeltaCallback})
    }
  };
  socialCheesecake.Sector.prototype.rotateTo = function(options) {
    var sector = this;
    var currentPhi = this.phi % (2 * Math.PI);
    var delta = this.delta;
    var step = 0.05;
    var anchor = 0;
    var stage = sector.getCheesecake().stage;
    var context = sector.getRegion().getLayer().getContext();
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
    while(currentPhi < 0) {
      currentPhi += 2 * Math.PI
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
    if(Math.abs(currentPhi - phiDestination) > 0.0010) {
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
  socialCheesecake.Sector.prototype.addNewSubsector = function(sectorIndex) {
    var subsectors = this.subsectors;
    var settings = {parent:this, x:this.x, y:this.y, delta:this.delta, phi:this.phi};
    for(var i = subsectors.length;i >= 0;i--) {
      if(i > sectorIndex) {
        subsectors[i] = subsectors[i - 1]
      }
      if(i == sectorIndex) {
        settings.label = "New Subsector " + i;
        subsectors[i] = new socialCheesecake.Subsector(settings)
      }
    }
    return subsectors[sectorIndex]
  };
  socialCheesecake.Sector.prototype.addActor = function(actorInfo, subsector) {
    var actors = this.actors;
    var actor;
    var actorAlreadyDeclared = false;
    for(var i in actors) {
      if(actors[i].id == actorInfo.id) {
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
        actor = this.parent.addActor(actorInfo, subsector)
      }else {
        actor = this.parent.grid.addActor(actorInfo, subsector)
      }
      actors.push(actor)
    }
    return actor
  };
  socialCheesecake.Sector.prototype.removeActor = function(actor) {
    var actors = this.actors;
    var actorParents;
    var actorPresentInSector = false;
    for(var actorIndex in actors) {
      if(actors[actorIndex].id == actor.id) {
        actorParents = actor.parents;
        for(var parent in actorParents) {
          for(var subsector in this.subsectors) {
            if(actorParents[parent] === this.subsectors[subsector]) {
              actorPresentInSector = true;
              break
            }
          }
        }
        if(!actorPresentInSector) {
          actors.splice(actorIndex, 1)
        }
      }
    }
  };
  socialCheesecake.Sector.prototype.getWidth = function() {
    return this.rOut - this.rIn
  };
  socialCheesecake.Sector.prototype.getMediumRadius = function() {
    return(this.rOut + this.rIn) / 2
  };
  socialCheesecake.Sector.prototype.listen = function(on) {
    var region = this.getRegion();
    var sector = this;
    if(on === undefined) {
      on = true
    }
    if(on) {
      region.on("mouseover", function() {
        sector.eventHandler("mouseover")
      });
      region.on("mouseout", function() {
        sector.eventHandler("mouseout")
      });
      region.on("click", function() {
        sector.eventHandler("click")
      });
      region.on("mouseup", function() {
        sector.eventHandler("mouseup")
      })
    }else {
      region.off("mouseover");
      region.off("mouseout");
      region.off("click");
      region.off("mouseup")
    }
  }
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.Subsector = function(settings) {
    this.id = settings.id || null;
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
    this.auxiliar = settings.auxiliar ? settings.auxiliar : false;
    this.type = settings.type ? settings.type : "normalSubsector";
    if(settings.simulate != null) {
      this.simulate = settings.simulate
    }
    if(settings.color) {
      this.color = settings.color
    }
    if(settings.fontColor) {
      this.fontColor = settings.fontColor
    }
    if(settings.borderColor) {
      this.borderColor = settings.borderColor
    }
    if(settings.click != null) {
      this.click = settings.click
    }
    if(settings.mouseup != null) {
      this.mouseup = settings.mouseup
    }
    if(settings.mouseover != null) {
      this.mouseover = settings.mouseover
    }
    if(settings.mouseout != null) {
      this.mouseout = settings.mouseout
    }
    var grid = this.getCheesecake().grid;
    if(settings.actors) {
      for(var actor in settings.actors) {
        var actor_info = {id:settings.actors[actor][0], name:settings.actors[actor][1], extraInfo:settings.actors[actor][2]};
        this.addActor(actor_info, this)
      }
    }
    this.originalAttr = {x:this.x, y:this.y, phi:this.phi, delta:this.delta, rIn:this.rIn, rOut:this.rOut, color:this.color, fontColor:this.fontColor, borderColor:this.borderColor, label:this.label, auxiliar:this.auxiliar, type:this.type, simulate:this.simulate}
  };
  socialCheesecake.Subsector.prototype = new socialCheesecake.Sector({id:this.id, parent:this.parent, center:{x:this.x, y:this.y}, label:this.label, rIn:this.rIn, rOut:this.rOut, phi:this.phi, delta:this.delta, auxiliar:this.auxiliar, color:this.color, fontColor:this.fontColor, borderColor:this.borderColor, type:this.type, simulate:this.simulate, mouseover:this.mouseover, mouseout:this.mouseout, mouseup:this.mouseup, click:this.click});
  socialCheesecake.Subsector.prototype.getCheesecake = function() {
    var subsector = this;
    return subsector.parent.parent
  };
  socialCheesecake.Subsector.prototype.removeActor = function(actor) {
    var actors = this.actors;
    var actorParents;
    for(var actorIndex in actors) {
      if(actors[actorIndex].id == actor.id) {
        actorParents = actor.parents;
        for(var parent in actorParents) {
          if(actorParents[parent] === this) {
            actorParents.splice(parent, 1)
          }
        }
        actors.splice(actorIndex, 1);
        this.parent.removeActor(actor)
      }
    }
  };
  socialCheesecake.Subsector.prototype.changeMembership = function(actors) {
    var actualActors = this.actors;
    var actorInfo;
    var isMember = false;
    for(var i in actors) {
      for(var j in actualActors) {
        if(actualActors[j].id == actors[i].id) {
          isMember = true;
          this.removeActor(actors[i]);
          break
        }
      }
      if(!isMember) {
        actorInfo = {id:actors[i].id};
        this.addActor(actorInfo, this)
      }
      this.getCheesecake().updateActorMembership(actors[i]);
      isMember = false
    }
    this.getCheesecake().calculatePortions()
  }
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.text = {style:"bold 14px sans-serif", newStyle:"bold 14px sans-serif", addPlusCharacter:function(context, x, y, r, phi, delta, color, style) {
    context.font = style && socialCheesecake.text[style] ? socialCheesecake.text[style] : socialCheesecake.text.style;
    context.fillStyle = color || "#000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    text = "+";
    context.translate(x, y);
    context.rotate(-delta / 2 - phi - Math.PI / 2);
    context.fillText(text[0], 0, r);
    context.restore();
    context.save()
  }, writeCurvedText:function(text, context, x, y, r, phi, delta, color, style) {
    context.font = style && socialCheesecake.text[style] ? socialCheesecake.text[style] : socialCheesecake.text.style;
    context.fillStyle = color || "#000";
    context.textBaseline = "middle";
    var medium_alpha = Math.tan(context.measureText(text).width / (text.length * r));
    var old_text = null;
    var original_text = text;
    while(medium_alpha * (text.length + 4) > delta) {
      if(old_text == text) {
        console.log("WARNING: Infinite loop detected and stopped. Text '" + original_text + "' failed to be " + "correctly truncated. Proccesed serveral times as '" + text + "' and will be returned as '" + words[0].substring(0, delta / medium_alpha - 7) + "'. Space too small to even be able to truncate.");
        text = words[0].substring(0, delta / medium_alpha - 7);
        break
      }else {
        old_text = text
      }
      words = text.split(" ");
      if(words.length > 1) {
        words.splice(words.length - 1, 1);
        text = words.join(" ") + "..."
      }else {
        text = words[0].substring(0, delta / medium_alpha - 7) + "..."
      }
      medium_alpha = Math.tan(context.measureText(text).width / (text.length * r))
    }
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
    context.restore();
    context.save()
  }, writeCenterText:function(text, context, centerX, centerY) {
    context.fillText(text, centerX - context.measureText(text).width / 2, centerY)
  }}
})();

