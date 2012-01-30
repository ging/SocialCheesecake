/*
 SocialCheesecake JavaScript Library v0.2.0
 https://github.com/adiezbal/SocialCheesecake
 Developed by Alicia D?ez (https://github.com/adiezbal)
 Copyright 2011, Technical University of Madrid (Universidad Polit?cnica de Madrid)
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
    var defaultSettings = {};
    for(var property in defaultSettings) {
      if(!(property in settings)) {
        settings[property] = defaultSettings[property]
      }
    }
    this.id = settings.id;
    this.name = settings.name;
    this.extraInfo = settings.extraInfo ? settings.extraInfo : undefined;
    this.opacity = 1;
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
      if(!actor.isSelected()) {
        actor.focus()
      }
      for(var subsector in actor.parents) {
        sector = actor.parents[subsector].parent;
        sector.focus();
        sector.changeColor(sector.mouseover.color);
        actor.parents[subsector].changeColor(actor.parents[subsector].mouseover.color)
      }
    }, false);
    actor_div.addEventListener("mouseout", function() {
      var sector;
      if(!actor.isSelected()) {
        actor.unfocus()
      }
      for(var subsector in actor.parents) {
        sector = actor.parents[subsector].parent;
        sector.unfocus();
        sector.changeColor(sector.mouseout.color);
        actor.parents[subsector].changeColor(sector.mouseout.color)
      }
    }, false);
    actor_div.addEventListener("mousedown", function() {
      var sector;
      if(actor.isSelected()) {
        actor.unselect()
      }else {
        actor.select()
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
  socialCheesecake.Actor.prototype.isSelected = function() {
    return this._selected
  };
  socialCheesecake.Actor.prototype.select = function() {
    var actor = this;
    actor._selected = true;
    actor.focus()
  };
  socialCheesecake.Actor.prototype.unselect = function() {
    var actor = this;
    actor._selected = false;
    actor.unfocus()
  };
  socialCheesecake.Actor.prototype.focus = function() {
    var actor_div = this.getDiv();
    var newClass = "";
    this._focused = true;
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
    var actor_div = this.getDiv();
    var newClass = "";
    this._focused = false;
    if(actor_div.getAttribute("class")) {
      newClass = actor_div.getAttribute("class").replace(/(^|\s)focused($|\s)/, "");
      actor_div.setAttribute("class", newClass)
    }
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
    var deltaOpacity = 1E3 / (60 * time);
    var grow = 0;
    if(this.fading == "out") {
      grow = -1
    }else {
      if(this.fading == "in") {
        grow = 1
      }
    }
    var opacity = this.opacity + grow * deltaOpacity;
    opacity = Math.round(opacity * 1E3) / 1E3;
    actor.setDivOpacity(opacity);
    if(this.fading == "out" && opacity >= 0 || this.fading == "in" && opacity <= 1) {
      requestAnimFrame(function() {
        actor.fade(time, modifyDisplay)
      })
    }else {
      this.fading = "none";
      if(modifyDisplay && opacity <= 0) {
        actor.hide()
      }
    }
  };
  socialCheesecake.Actor.prototype.fadeOut = function(time, modifyDisplay) {
    this.fading = "out";
    this.setDivOpacity(1);
    this.fade(time, modifyDisplay)
  };
  socialCheesecake.Actor.prototype.fadeIn = function(time, modifyDisplay) {
    var actor = this;
    if(actor.isFiltered()) {
      return
    }
    actor.fading = "in";
    actor.setDivOpacity(0);
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
  socialCheesecake.colors = {normalSector:{background:"#eeffee", highlight:"#77ff77", hover:"#aaffaa", font:"#1F4A75", border:"#1F4A75"}, extraSector:{background:"#e5e5e5", highlight:"#1FA0F7", hover:"#D4E4EA", font:"#1F4A75", border:"#1F4A75"}, greySector:{background:"#f5f5f5", highlight:"#f5f5f5", hover:"#f5f5f5", font:"#666", border:"#666"}};
  var maxVisibleActors = 30;
  socialCheesecake.Cheesecake = function(cheesecakeData) {
    var jsonSectors = cheesecakeData.sectors;
    var cheesecake = this;
    cheesecake.center = {x:cheesecakeData.center.x, y:cheesecakeData.center.y};
    cheesecake.rMax = cheesecakeData.rMax;
    cheesecake.sectors = [];
    cheesecake.highlightedSector = null;
    cheesecake.highlightedSectorCallback = cheesecakeData.highlightedSectorCallback || undefined;
    cheesecake.auxiliarSectors = [];
    cheesecake.stage = new Kinetic.Stage(cheesecakeData.container.id, cheesecakeData.container.width, cheesecakeData.container.height);
    cheesecake.stage.add(new Kinetic.Layer);
    cheesecake.stage.mainLayer = cheesecake.stage.layers[0];
    cheesecake.grid = new socialCheesecake.Grid({parent:this, grid_id:cheesecakeData.grid.id, divIdPrefix:cheesecakeData.grid.divIdPrefix || "actor_"});
    cheesecake.searchEngine = new socialCheesecake.SearchEngine({parent:this});
    cheesecake.matchActorsNumber = cheesecakeData.match;
    if(cheesecake.matchActorsNumber == null) {
      cheesecake.matchActorsNumber = true
    }
    cheesecake._initialState = {};
    cheesecake._changes = {};
    cheesecake.onChange = function(cheesecake) {
    };
    if(cheesecakeData.maxVisibleActors != undefined) {
      socialCheesecake.Cheesecake.setMaxVisibleActors(cheesecakeData.maxVisibleActors)
    }
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
      var extraSector = new socialCheesecake.Sector({parent:cheesecake, center:{x:cheesecakeData.center.x, y:cheesecakeData.center.y}, label:"+", rOut:cheesecakeData.rMax, color:socialCheesecake.colors.extraSector.background, mouseover:{color:socialCheesecake.colors.extraSector.hover, callback:function(sector) {
        sector.focus();
        cheesecake.grid.hideAll()
      }}, mouseout:{color:socialCheesecake.colors.extraSector.background, callback:function(sector) {
        sector.unfocus();
        cheesecake.grid.fadeInAll(300, true)
      }}, mouseup:{color:socialCheesecake.colors.extraSector.background}, mousedown:{color:socialCheesecake.colors.extraSector.highlight}, subsectors:[{name:"New Subsector 1"}], auxiliar:true, fontColor:socialCheesecake.colors.extraSector.font, borderColor:socialCheesecake.colors.extraSector.border});
      cheesecake.sectors[jsonSectors.length] = extraSector
    }
    var minNumSectors = Math.min(jsonSectors.length, 16);
    for(var i = 0;i < minNumSectors;i++) {
      var settings = {parent:cheesecake, center:{x:cheesecakeData.center.x, y:cheesecakeData.center.y}, id:jsonSectors[i].id, label:jsonSectors[i].name, rOut:cheesecakeData.rMax, subsectors:jsonSectors[i].subsectors, mouseover:{color:socialCheesecake.colors.normalSector.hover, callback:function(sector) {
        document.body.style.cursor = "pointer";
        cheesecake.grid.hideAll();
        cheesecake.grid.fadeIn(sector.actors, 300, true);
        sector.focus();
        if(cheesecake.highlightedSector != null) {
          cheesecake.highlightedSector.fan(false, function() {
            sector.fan(true)
          })
        }else {
          sector.fan(true)
        }
        sector.getCheesecake().setHighlightedSector(sector)
      }}, mouseout:{color:socialCheesecake.colors.normalSector.background, callback:function(sector) {
        document.body.style.cursor = "default";
        cheesecake.grid.hide(sector.actors);
        cheesecake.grid.fadeInAll(300, true);
        sector.unfocus();
        sector.getCheesecake().setHighlightedSector(null);
        sector.fan(false)
      }}, mousedown:{color:socialCheesecake.colors.normalSector.highlight, callback:function(sector) {
        cheesecake.focusAndBlurCheesecake(sector);
        cheesecake.grid.hideAll();
        cheesecake.grid.fadeIn(sector.actors, 300, true)
      }}, mouseup:{color:socialCheesecake.colors.normalSector.background}, fontColor:socialCheesecake.colors.normalSector.font, borderColor:socialCheesecake.colors.normalSector.border};
      cheesecake.sectors[i] = new socialCheesecake.Sector(settings)
    }
    cheesecake.calculatePortions();
    cheesecake._setInitialState();
    cheesecake.draw()
  };
  socialCheesecake.Cheesecake.prototype.draw = function() {
    var sectors = this.sectors;
    var mainLayer = this.stage.mainLayer;
    for(var sector in sectors) {
      mainLayer.add(sectors[sector].getRegion())
    }
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
    var mainLayer = this.stage.mainLayer;
    var regions = mainLayer.getShapes();
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
        mainLayer.remove(regions[i])
      }
    }
    mainLayer.clear();
    this.setHighlightedSector(sector);
    var greySettings = {parent:cheesecake, center:{x:cheesecake.center.x, y:cheesecake.center.y}, phi:sector.phi + sector.delta, delta:2 * Math.PI - sector.delta, rOut:cheesecake.rMax, mouseout:{color:socialCheesecake.colors.greySector.background, callback:function() {
      document.body.style.cursor = "default"
    }}, mousedown:{color:socialCheesecake.colors.greySector.highlight}, mouseup:{color:socialCheesecake.colors.greySector.background}, mouseover:{color:socialCheesecake.colors.greySector.hover, callback:function() {
      document.body.style.cursor = "pointer"
    }}, color:socialCheesecake.colors.greySector.background, fontColor:socialCheesecake.colors.greySector.font, borderColor:socialCheesecake.colors.greySector.border, auxiliar:true};
    var dummySettings = {parent:cheesecake, center:{x:cheesecake.center.x, y:cheesecake.center.y}, phi:sector.phi, delta:sector.delta, rOut:sector.rOut, label:sector.label, simulate:sectorIndex, mouseout:{callback:function() {
      document.body.style.cursor = "default"
    }}, mouseover:{callback:function() {
      document.body.style.cursor = "pointer"
    }}, auxiliar:true};
    var greySector = new socialCheesecake.Sector(greySettings);
    cheesecake.auxiliarSectors.push(greySector);
    var dummySector = new socialCheesecake.Sector(dummySettings);
    cheesecake.auxiliarSectors.push(dummySector);
    mainLayer.add(greySector.getRegion());
    mainLayer.add(dummySector.getRegion());
    var greyMousedownCallback = function() {
      greySector.label = "";
      cheesecake.unfocusAndUnblurCheesecake()
    };
    var greyResizeCallback = function() {
      greySector.mousedown.callback = greyMousedownCallback;
      greySector.label = "GO BACK"
    };
    var greyRotateToCallback = function() {
      greySector.resizeDelta({delta:3 * Math.PI / 2, anchor:"M", callback:greyResizeCallback})
    };
    var dummyResizeCallback = function() {
      dummySector.splitUp()
    };
    var dummyRotateToCallback = function() {
      dummySector.resizeDelta({anchor:"M", callback:dummyResizeCallback})
    };
    greySector.rotateTo({destination:5 * Math.PI / 4, callback:greyRotateToCallback, anchor:"M"});
    dummySector.rotateTo({destination:Math.PI / 4, callback:dummyRotateToCallback, anchor:"M"})
  };
  socialCheesecake.Cheesecake.prototype.recoverCheesecake = function() {
    var cheesecake = this;
    var lastSector = this.highlightedSector;
    var mainLayer = this.stage.mainLayer;
    var regions = mainLayer.getShapes();
    for(var i = regions.length - 1;i >= 0;i--) {
      if(!regions[i].permanent) {
        mainLayer.remove(regions[i]);
        cheesecake.auxiliarSectors.pop()
      }
    }
    mainLayer.clear();
    cheesecake.draw();
    if(lastSector) {
      lastSector.color = lastSector.originalAttr.color;
      lastSector.fan(false);
      lastSector.unfocus();
      this.setHighlightedSector(null)
    }
    cheesecake.grid.fadeInAll(300, true)
  };
  socialCheesecake.Cheesecake.prototype.unfocusAndUnblurCheesecake = function() {
    var cheesecake = this;
    var auxiliarSectors = this.auxiliarSectors;
    var sector;
    var sectorNewDelta;
    var sectorNewPhi;
    var greySector;
    for(var i in auxiliarSectors) {
      if(auxiliarSectors[i].simulate != null) {
        sector = auxiliarSectors[i]
      }else {
        greySector = auxiliarSectors[i]
      }
    }
    sectorNewDelta = cheesecake.sectors[sector.simulate].delta;
    sectorNewPhi = cheesecake.sectors[sector.simulate].phi;
    sector.putTogether();
    sector.resizeDelta({anchor:"M", delta:sectorNewDelta, callback:function() {
      sector.rotateTo({destination:sectorNewPhi})
    }});
    greySector.resizeDelta({anchor:"M", delta:2 * Math.PI - sectorNewDelta, callback:function() {
      greySector.rotateTo({destination:sectorNewPhi + sectorNewDelta, callback:function() {
        cheesecake.recoverCheesecake()
      }})
    }})
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
  socialCheesecake.Cheesecake.prototype.setHighlightedSector = function(sector) {
    if(this.highlightedSector != sector) {
      this.highlightedSector = sector;
      if(this.highlightedSectorCallback) {
        this.highlightedSectorCallback(this)
      }
    }
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
  };
  socialCheesecake.Cheesecake.getMaxVisibleActors = function() {
    return maxVisibleActors
  };
  socialCheesecake.Cheesecake.setMaxVisibleActors = function(number) {
    if(typeof number === "number") {
      maxVisibleActors = number
    }
  }
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
    this.visibleActors = []
  };
  socialCheesecake.Grid.prototype.addActor = function(actor_info, subsector) {
    var actors = this.actors;
    var visibleActors = this.visibleActors;
    var maxVisibleActors = socialCheesecake.Cheesecake.getMaxVisibleActors();
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
      actors.push(actor);
      if(actors.length <= maxVisibleActors) {
        actor.show();
        visibleActors.push(actor)
      }
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
    var actors = this.visibleActors;
    var selectedActors = [];
    for(var i in actors) {
      if(actors[i] && actors[i].isSelected()) {
        selectedActors.push(actors[i])
      }
    }
    return selectedActors
  };
  socialCheesecake.Grid.prototype.getShownActors = function() {
    return this.visibleActors
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
    this.select(this.visibleActors)
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
    this.unselect(this.visibleActors)
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
    this.focus(this.visibleActors)
  };
  socialCheesecake.Grid.prototype.hide = function(actor_ids, ignoreSelected) {
    var actor;
    var visibleActors = this.visibleActors;
    var visibleActorIndex = -1;
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        actor = actor_ids[i];
        if(actor) {
          if(!(actor instanceof socialCheesecake.Actor)) {
            actor = this.getActor(actor)
          }
          if(!actor.isSelected() || ignoreSelected) {
            actor.hide();
            visibleActors[visibleActors.indexOf(actor)] = false
          }
        }
      }
    }else {
      if(actor_ids instanceof socialCheesecake.Actor) {
        actor = actor_ids
      }else {
        actor = this.getActor(actor_ids)
      }
      actor.hide();
      visibleActors[visibleActors.indexOf(actor)] = false
    }
    visibleActorIndex = visibleActors.indexOf(false);
    while(visibleActorIndex >= 0) {
      visibleActors.splice(visibleActorIndex, 1);
      visibleActorIndex = visibleActors.indexOf(false)
    }
  };
  socialCheesecake.Grid.prototype.hideAll = function() {
    this.hide(this.visibleActors)
  };
  socialCheesecake.Grid.prototype.show = function(actor_ids) {
    var actor;
    var visibleActors = this.visibleActors;
    var maxActors = Math.min(actor_ids.length, socialCheesecake.Cheesecake.getMaxVisibleActors());
    if(actor_ids instanceof Array) {
      for(var i = 0;visibleActors.length < maxActors;i++) {
        actor = actor_ids[i];
        if(actor) {
          if(!(actor instanceof socialCheesecake.Actor)) {
            actor = this.getActor(actor)
          }
          if(!actor.isSelected() || ignoreSelected) {
            actor.show();
            if(visibleActors.indexOf(actor) == -1) {
              visibleActors.push(actor)
            }
          }
        }
      }
    }else {
      if(visibleActors.length < maxActors) {
        if(actor_ids instanceof socialCheesecake.Actor) {
          actor = actor_ids
        }else {
          actor = this.getActor(actor_ids)
        }
        if(!actor.isSelected() || ignoreSelected) {
          actor.show();
          if(visibleActors.indexOf(actor) == -1) {
            visibleActors.push(actor)
          }
        }
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
        if(actor) {
          if(!(actor instanceof socialCheesecake.Actor)) {
            actor = this.getActor(actor)
          }
          actor.unfocus()
        }
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
    this.unfocus(this.visibleActors)
  };
  socialCheesecake.Grid.prototype.fadeOut = function(actor_ids, time, modifyDisplay, ignoreSelected) {
    var actor;
    var visibleActors = this.visibleActors;
    var visibleActorIndex = -1;
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        actor = actor_ids[i];
        if(actor) {
          if(!(actor instanceof socialCheesecake.Actor)) {
            actor = this.getActor(actor)
          }
          if(!actor.isSelected() || ignoreSelected) {
            actor.fadeOut(time, modifyDisplay);
            visibleActors[visibleActors.indexOf(actor)] = false
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
        actor.fadeOut(time, modifyDisplay);
        visibleActors[visibleActors.indexOf(actor)] = false
      }
    }
    visibleActorIndex = visibleActors.indexOf(false);
    while(visibleActorIndex >= 0) {
      visibleActors.splice(visibleActorIndex, 1);
      visibleActorIndex = visibleActors.indexOf(false)
    }
  };
  socialCheesecake.Grid.prototype.fadeOutAll = function(time, modifyDisplay) {
    this.fadeOut(this.visibleActors, time, modifyDisplay)
  };
  socialCheesecake.Grid.prototype.fadeIn = function(actor_ids, time, modifyDisplay, ignoreSelected) {
    var actor;
    var visibleActors = this.visibleActors;
    var maxActors = Math.min(actor_ids.length, socialCheesecake.Cheesecake.getMaxVisibleActors());
    if(actor_ids instanceof Array) {
      for(var i = 0;visibleActors.length < maxActors;i++) {
        actor = actor_ids[i];
        if(actor) {
          if(!(actor instanceof socialCheesecake.Actor)) {
            actor = this.getActor(actor)
          }
          if(!actor.isSelected() || ignoreSelected) {
            actor.fadeIn(time, modifyDisplay);
            if(visibleActors.indexOf(actor) == -1) {
              visibleActors.push(actor)
            }
          }
        }
      }
    }else {
      if(visibleActors.length < maxActors) {
        if(actor_ids instanceof socialCheesecake.Actor) {
          actor = actor_ids
        }else {
          actor = this.getActor(actor_ids)
        }
        if(!actor.isSelected() || ignoreSelected) {
          actor.fadeIn(time, modifyDisplay);
          if(visibleActors.indexOf(actor) == -1) {
            visibleActors.push(actor)
          }
        }
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
    var defaultSettings = {center:{x:0, y:0}, rIn:0, rOut:300, delta:Math.PI / 2, phi:0, label:"", color:socialCheesecake.colors.normalSector.background, fontColor:socialCheesecake.colors.normalSector.font, borderColor:socialCheesecake.colors.normalSector.border, mouseover:{color:socialCheesecake.colors.normalSector.hover}, mouseout:{color:socialCheesecake.colors.normalSector.background}, mouseup:{color:socialCheesecake.colors.normalSector.background}, mousedown:{color:socialCheesecake.colors.normalSector.highlight}, 
    auxiliar:false};
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
    this.fontColor = settings.fontColor;
    this.borderColor = settings.borderColor;
    this.mouseover = settings.mouseover;
    this.mouseup = settings.mouseup;
    this.mouseout = settings.mouseout;
    this.mousedown = settings.mousedown;
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
    if(settings.subsectors != null) {
      var rInSubsector = this.rIn;
      var separation = (this.rOut - this.rIn) / settings.subsectors.length;
      for(var i in settings.subsectors) {
        var rOutSubsector = rInSubsector + separation;
        var subsector = new socialCheesecake.Subsector({id:settings.subsectors[i].id, label:settings.subsectors[i].name, parent:this, x:this.x, y:this.y, phi:this.phi, delta:this.delta, rIn:rInSubsector, rOut:rOutSubsector, actors:settings.subsectors[i].actors, color:socialCheesecake.colors.normalSector.background, borderColor:socialCheesecake.colors.normalSector.border, fontColor:socialCheesecake.colors.normalSector.font, mouseover:{color:socialCheesecake.colors.normalSector.hover, callback:function(subsector) {
          document.body.style.cursor = "pointer";
          subsector.getCheesecake().grid.hideAll();
          subsector.getCheesecake().grid.fadeIn(subsector.actors, 300, true);
          subsector.getCheesecake().setHighlightedSector(subsector);
          subsector.getCheesecake().stage.mainLayer.draw()
        }}, mouseout:{color:socialCheesecake.colors.normalSector.background, callback:function(subsector) {
          document.body.style.cursor = "default";
          subsector.getCheesecake().grid.fadeIn(subsector.parent.actors, 300, true);
          subsector.getCheesecake().setHighlightedSector(subsector.parent)
        }}, mousedown:{color:socialCheesecake.colors.normalSector.highlight, callback:function(subsector) {
          var selectedActors = subsector.getCheesecake().grid.getSelectedActors();
          if(selectedActors.length > 0) {
            subsector.changeMembership(selectedActors)
          }
        }}, mouseup:{color:socialCheesecake.colors.normalSector.background}});
        rInSubsector = rOutSubsector;
        this.subsectors.push(subsector)
      }
    }
    this.originalAttr = {x:this.x, y:this.y, phi:this.phi, delta:this.delta, rIn:this.rIn, rOut:this.rOut, color:this.color, fontColor:this.fontColor, borderColor:this.borderColor, label:this.label, mouseover:this.mouseover, mouseout:this.mouseout, mousedown:this.mousedown, mouseup:this.mouseup, simulate:this.simulate, subsectors:this.subsectors, auxiliar:this.auxiliar};
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
    var fontColor = this.fontColor;
    var borderColor = this.borderColor;
    var label = this.label;
    var actors = this.actors;
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
    context.strokeStyle = borderColor;
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
      });
      sector._region.on("mouseover", function() {
        sector.eventHandler("mouseover")
      });
      sector._region.on("mouseout", function() {
        sector.eventHandler("mouseout")
      });
      sector._region.on("mousedown", function() {
        sector.eventHandler("mousedown")
      });
      sector._region.on("mouseup", function() {
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
    var mainLayer = cheesecake.stage.mainLayer;
    var phi = this.phi;
    var delta = this.delta;
    var rOut = this.rOut;
    var rIn = this.rIn;
    var sector = this.simulate != null ? cheesecake.sectors[this.simulate] : this;
    var subsectors = sector.subsectors;
    var parts = subsectors.length * 2 + 1;
    var subsectorRIn = rIn;
    var extraWidth = (rOut - rIn) * 0.06;
    var sectorWidth = (rOut - rIn - (parts - subsectors.length) * extraWidth) / subsectors.length;
    var extraSettings = {x:cheesecake.center.x, y:cheesecake.center.y, delta:delta, phi:phi, label:"+", parent:this, auxiliar:true, color:socialCheesecake.colors.extraSector.background, borderColor:socialCheesecake.colors.extraSector.border, fontColor:socialCheesecake.colors.extraSector.font, mouseover:{color:socialCheesecake.colors.extraSector.hover, callback:function(sector) {
      sector.resizeWidth({width:extraWidth * 1.5, anchor:"m", step:1})
    }}, mouseout:{color:socialCheesecake.colors.extraSector.background, callback:function(sector) {
      sector.resizeWidth({width:extraWidth, anchor:"m", step:1, priority:true})
    }}, mousedown:{color:socialCheesecake.colors.extraSector.highlight}, mouseup:{color:socialCheesecake.colors.extraSector.background}};
    for(var i in subsectors) {
      rIn += extraWidth;
      subsectors[i].rIn = rIn;
      subsectors[i].rOut = rIn + sectorWidth;
      subsectors[i].phi = phi;
      subsectors[i].delta = delta;
      mainLayer.add(subsectors[i].getRegion());
      rIn += sectorWidth
    }
    rIn = 0;
    for(var i = 0;i < parts - subsectors.length;i++) {
      if(i == 0) {
        var extraSettingsFirst = {x:cheesecake.center.x, y:cheesecake.center.y, rIn:rIn, rOut:rIn + extraWidth, delta:delta, phi:phi, label:"+", parent:this, auxiliar:true, color:socialCheesecake.colors.extraSector.background, borderColor:socialCheesecake.colors.extraSector.border, fontColor:socialCheesecake.colors.extraSector.font, mouseover:{color:socialCheesecake.colors.extraSector.hover, callback:function(sector) {
          sector.resizeWidth({width:extraWidth * 1.5, anchor:"rin", step:1})
        }}, mouseout:{color:socialCheesecake.colors.extraSector.background, callback:function(sector) {
          sector.resizeWidth({width:extraWidth, anchor:"rin", step:1, priority:true})
        }}, mousedown:{color:socialCheesecake.colors.extraSector.highlight}, mouseup:{color:socialCheesecake.colors.extraSector.background}};
        var extraSector = new socialCheesecake.Subsector(extraSettingsFirst)
      }else {
        extraSettings["rIn"] = rIn;
        extraSettings["rOut"] = rIn + extraWidth;
        var extraSector = new socialCheesecake.Subsector(extraSettings)
      }
      mainLayer.add(extraSector.getRegion());
      this.extraSubsectors.push(extraSector);
      rIn += extraWidth + sectorWidth
    }
    mainLayer.draw()
  };
  socialCheesecake.Sector.prototype.putTogether = function() {
    var cheesecake = this.getCheesecake();
    var mainLayer = cheesecake.stage.mainLayer;
    var sector = this.simulate != null ? cheesecake.sectors[this.simulate] : this;
    var subsectors = sector.subsectors;
    var extraSubsectors = this.extraSubsectors;
    for(var i = extraSubsectors.length;i > 0;i--) {
      mainLayer.remove(extraSubsectors.pop().getRegion())
    }
    for(var i in subsectors) {
      mainLayer.remove(subsectors[i].getRegion())
    }
  };
  socialCheesecake.Sector.prototype.changeColor = function(color) {
    var sector = this;
    var stage = sector.getCheesecake().stage;
    var context = stage.mainLayer.getContext();
    sector.color = color;
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
      sector.growDelta = undefined;
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
    var error = false;
    var goOn = true;
    if(options.step) {
      step = options.step
    }
    if(options.width) {
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
    if(currentRIn < 0 || currentROut < 0) {
      console.log("WARNING!! Width cannot change anymore. It has reached it maximum/ minimum level.");
      error = true
    }else {
      sector.rOut = currentROut;
      sector.rIn = currentRIn;
      context.restore();
      context.save();
      stage.draw()
    }
    if(goOn && !error && Math.round(currentWidth * 1E3) != Math.round(goalWidth * 1E3)) {
      requestAnimFrame(function() {
        sector.resizeWidth(options)
      })
    }else {
      sector.grow = undefined;
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
    var currentPhi = this.phi;
    var delta = this.delta;
    var step = 0.05;
    var anchor = 0;
    var stage = sector.getCheesecake().stage;
    var context = stage.mainLayer.getContext();
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
  socialCheesecake.Subsector = function(settings) {
    this.id = settings.id;
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
    if(settings.color) {
      this.color = settings.color
    }
    if(settings.fontColor) {
      this.fontColor = settings.fontColor
    }
    if(settings.borderColor) {
      this.borderColor = settings.borderColor
    }
    if(settings.mousedown != null) {
      this.mousedown = settings.mousedown
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
  };
  socialCheesecake.Subsector.prototype = new socialCheesecake.Sector({id:this.id, parent:this.parent, center:{x:this.x, y:this.y}, label:this.label, rIn:this.rIn, rOut:this.rOut, phi:this.phi, delta:this.delta, auxiliar:this.auxiliar, color:this.color, fontColor:this.fontColor, borderColor:this.borderColor, mouseover:this.mouseover, mouseout:this.mouseout, mouseup:this.mouseup, mousedown:this.mousedown});
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

