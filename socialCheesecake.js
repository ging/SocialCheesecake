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
    this.opacity = 1;
    this._focused = false;
    this._selected = false;
    this._hidden = false;
    this._filtered = false;
    this.fading = "none";
    this.parents = [];
    if(settings.parent) {
      this.parents.push(settings.parent)
    }
    var actor = this;
    var actor_div = actor.getDiv();
    var mouseoverCallback = function() {
      var sector;
      actor.focus();
      for(var subsector in actor.parents) {
        sector = actor.parents[subsector].parent;
        sector.focus();
        sector.changeColor(sector.mouseover.color);
        actor.parents[subsector].changeColor(actor.parents[subsector].mouseover.color)
      }
    };
    var mouseoutCallback = function() {
      var sector;
      actor.unfocus();
      for(var subsector in actor.parents) {
        sector = actor.parents[subsector].parent;
        sector.unfocus();
        sector.changeColor(sector.mouseout.color);
        actor.parents[subsector].changeColor(sector.mouseout.color)
      }
    };
    actor_div.addEventListener("mouseover", mouseoverCallback, false);
    actor_div.addEventListener("mouseout", mouseoutCallback, false);
    actor_div.addEventListener("mousedown", function() {
      var sector;
      if(actor.isSelected()) {
        actor._selected = false;
        actor.unfocus();
        actor_div.addEventListener("mouseover", mouseoverCallback, false);
        actor_div.addEventListener("mouseout", mouseoutCallback, false)
      }else {
        actor._selected = true;
        actor.focus();
        actor_div.removeEventListener("mouseover", mouseoverCallback, false);
        actor_div.removeEventListener("mouseout", mouseoutCallback, false)
      }
    })
  };
  socialCheesecake.Actor.prototype.isSelected = function() {
    return this._selected
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
    this.setDivOpacity(0);
    this.fading = "none"
  };
  socialCheesecake.Actor.prototype.show = function() {
    if(this.isFiltered()) {
      return
    }
    var actor_div = this.getDiv();
    this._hidden = false;
    if(actor_div.getAttribute("style")) {
      var newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*none;/, "");
      actor_div.setAttribute("style", newStyle)
    }
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
    var deltaOpacity = 1E3 / (60 * time);
    var grow = 0;
    if(this.fading == "out") {
      grow = -1
    }else {
      if(this.fading == "in") {
        grow = 1;
        if(modifyDisplay) {
          actor.show()
        }
      }
    }
    var opacity = this.opacity + grow * deltaOpacity;
    opacity = Math.round(opacity * 1E3) / 1E3;
    actor.setDivOpacity(opacity);
    var x = actor.opacity;
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
    this.fade(time, modifyDisplay)
  };
  socialCheesecake.Actor.prototype.fadeIn = function(time, modifyDisplay) {
    if(this.isFiltered()) {
      return
    }
    this.fading = "in";
    this.fade(time, modifyDisplay)
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
  var sectorFillColor = "#eeffee";
  var sectorFocusColor = "#77ff77";
  var sectorHoverColor = "#aaffaa";
  var sectorTextAndStrokeColor = "#1F4A75";
  var extraSectorFillColor = "#D4E4EA";
  var extraFocusColor = "#1FA0F7";
  var extraHoverColor = "#1FA0F7";
  var extraTextAndStrokeColor = "#1F4A75";
  var greySectorFillColor = "#f5f5f5";
  var greyFocusColor = "#f5f5f5";
  var greyHoverColor = "#f5f5f5";
  var greyTextAndStrokeColor = "#666";
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
    cheesecake.grid = new socialCheesecake.Grid({parent:this, grid_id:cheesecakeData.grid.id, divIdPrefix:cheesecakeData.grid.divIdPrefix || "actor_"});
    cheesecake.searchEngine = new socialCheesecake.SearchEngine({parent:this});
    cheesecake.matchActorsNumber = cheesecakeData.match || true;
    cheesecake.changes = {};
    var extraSector = new socialCheesecake.Sector({parent:cheesecake, center:{x:cheesecakeData.center.x, y:cheesecakeData.center.y}, label:"+", rOut:cheesecakeData.rMax, color:socialCheesecake.Cheesecake.getExtraSectorFillColor(), mouseover:{color:socialCheesecake.Cheesecake.getExtraSectorHoverColor(), callback:function(sector) {
      sector.focus()
    }}, mouseout:{color:socialCheesecake.Cheesecake.getExtraSectorFillColor(), callback:function(sector) {
      sector.unfocus()
    }}, mouseup:{color:socialCheesecake.Cheesecake.getExtraSectorFillColor()}, mousedown:{color:socialCheesecake.Cheesecake.getExtraSectorFocusColor()}, auxiliar:true, textAndStrokeColor:socialCheesecake.Cheesecake.getExtraSectorTextAndStrokeColor()});
    cheesecake.sectors[jsonSectors.length] = extraSector;
    for(var i = 0;i < jsonSectors.length;i++) {
      var settings = {parent:cheesecake, center:{x:cheesecakeData.center.x, y:cheesecakeData.center.y}, label:jsonSectors[i].name, rOut:cheesecakeData.rMax, subsectors:jsonSectors[i].subsectors, mouseover:{color:socialCheesecake.Cheesecake.getSectorHoverColor(), callback:function(sector) {
        for(var i in cheesecake.sectors) {
          cheesecake.sectors[i].getRegion().removeEventListener("mouseout");
          if(cheesecake.sectors[i] != sector) {
            cheesecake.sectors[i].unfocus();
            cheesecake.sectors[i].changeColor(cheesecake.sectors[i].mouseout.color)
          }
        }
        sector.getRegion().addEventListener("mouseout", function() {
          sector.eventHandler("mouseout")
        });
        document.body.style.cursor = "pointer";
        cheesecake.grid.hideAll();
        cheesecake.grid.fadeIn(sector.actors, 300, true);
        sector.focus();
        sector.getCheesecake().setHighlightedSector(sector)
      }}, mouseout:{color:socialCheesecake.Cheesecake.getSectorFillColor(), callback:function(sector) {
        document.body.style.cursor = "default";
        cheesecake.grid.fadeInAll(300, true);
        sector.unfocus();
        sector.getCheesecake().setHighlightedSector(null)
      }}, mousedown:{color:socialCheesecake.Cheesecake.getSectorFocusColor(), callback:function(sector) {
        cheesecake.focusAndBlurCheesecake(sector);
        cheesecake.grid.hideAll();
        cheesecake.grid.fadeIn(sector.actors, 300, true)
      }}, mouseup:{color:socialCheesecake.Cheesecake.getSectorFillColor()}, textAndStrokeColor:socialCheesecake.Cheesecake.getSectorTextAndStrokeColor()};
      cheesecake.sectors[i] = new socialCheesecake.Sector(settings)
    }
    cheesecake.calculatePortions();
    cheesecake.draw()
  };
  socialCheesecake.Cheesecake.prototype.draw = function() {
    var sectors = this.sectors;
    for(var sector in sectors) {
      this.stage.add(sectors[sector].getRegion())
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
    this.setHighlightedSector(sector);
    var greySettings = {parent:cheesecake, center:{x:cheesecake.center.x, y:cheesecake.center.y}, phi:sector.phi + sector.delta, delta:2 * Math.PI - sector.delta, rOut:cheesecake.rMax, mouseout:{color:socialCheesecake.Cheesecake.getGreySectorFillColor(), callback:function() {
      document.body.style.cursor = "default"
    }}, mousedown:{color:socialCheesecake.Cheesecake.getGreySectorFocusColor()}, mouseup:{color:socialCheesecake.Cheesecake.getGreySectorFillColor()}, mouseover:{color:socialCheesecake.Cheesecake.getGreySectorHoverColor(), callback:function() {
      document.body.style.cursor = "pointer"
    }}, color:socialCheesecake.Cheesecake.getGreySectorFillColor(), textAndStrokeColor:socialCheesecake.Cheesecake.getGreySectorTextAndStrokeColor(), auxiliar:true};
    var dummySettings = {parent:cheesecake, center:{x:cheesecake.center.x, y:cheesecake.center.y}, phi:sector.phi, delta:sector.delta, rOut:sector.rOut, label:sector.label, simulate:sectorIndex, mouseout:{callback:function() {
      document.body.style.cursor = "default"
    }}, mouseover:{callback:function() {
      document.body.style.cursor = "pointer"
    }}, auxiliar:true};
    var greySector = new socialCheesecake.Sector(greySettings);
    cheesecake.auxiliarSectors.push(greySector);
    var dummySector = new socialCheesecake.Sector(dummySettings);
    cheesecake.auxiliarSectors.push(dummySector);
    cheesecake.stage.add(greySector.getRegion());
    cheesecake.stage.add(dummySector.getRegion());
    var greyMousedownCallback = function() {
      greySector.label = "";
      cheesecake.unfocusAndUnblurCheesecake();
      cheesecake.grid.showAll()
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
    var regions = cheesecake.stage.getShapes();
    for(var i = regions.length - 1;i >= 0;i--) {
      if(!regions[i].permanent) {
        cheesecake.stage.remove(regions[i])
      }
    }
    cheesecake.auxiliarSectors.pop();
    cheesecake.draw();
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
    this.setHighlightedSector(null);
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
  socialCheesecake.Cheesecake.prototype.updateActorMembership = function(actorId) {
    var changes = this.changes;
    var grid = this.grid;
    var changesInActors;
    var alreadyChanged = false;
    var actorParents = grid.getActor(actorId).parents;
    var actorSubsectors = [];
    for(var parent in actorParents) {
      actorSubsectors.push(actorParents[parent].id)
    }
    if(changes.actors != undefined) {
      changesInActors = changes.actors;
      for(var actor in changesInActors) {
        if(changesInActors[actor].id == actorId) {
          alreadyChanged = true;
          changesInActors[actor].subsectors = actorSubsectors
        }
      }
      if(!alreadyChanged) {
        changesInActors.push({id:actorId, subsectors:actorSubsectors})
      }
    }else {
      changes.actors = [];
      changes.actors.push({id:actorId, subsectors:actorSubsectors})
    }
  };
  socialCheesecake.Cheesecake.prototype.calculatePortions = function() {
    var sectors = this.sectors;
    var match = this.matchActorsNumber;
    var deltaExtra = Math.PI / 8;
    var deltaSector;
    var minDeltaSector = Math.PI / 6;
    var phi = 5 * Math.PI / 4 - deltaExtra / 2;
    var sectorActors;
    var totalActors = 0;
    var consideredActors = 0;
    var littleSectors = 0;
    var isLittle = [];
    sectors[sectors.length - 1].phi = phi;
    sectors[sectors.length - 1].delta = deltaExtra;
    sectors[sectors.length - 1].originalAttr.phi = sectors[sectors.length - 1].phi;
    sectors[sectors.length - 1].originalAttr.delta = sectors[sectors.length - 1].delta;
    phi += deltaExtra;
    if(this.grid.actors.length == 0) {
      match = false
    }
    if(match) {
      for(var i = 0;i < sectors.length - 1;i++) {
        totalActors += sectors[i].actors.length
      }
      consideredActors = totalActors;
      for(var i = 0;i < sectors.length - 1;i++) {
        sectorActors = sectors[i].actors.length;
        if(sectorActors / totalActors <= 0.1) {
          isLittle[i] = true;
          littleSectors++;
          consideredActors -= sectors[i].actors.length
        }
      }
      for(var i = 0;i < sectors.length - 1;i++) {
        if(isLittle[i]) {
          deltaSector = minDeltaSector
        }else {
          deltaSector = sectors[i].actors.length / consideredActors * (2 * Math.PI - deltaExtra - littleSectors * minDeltaSector)
        }
        sectors[i].phi = phi;
        sectors[i].delta = deltaSector;
        sectors[i].originalAttr.phi = sectors[i].phi;
        sectors[i].originalAttr.delta = sectors[i].delta;
        phi += deltaSector
      }
    }else {
      deltaSector = (2 * Math.PI - deltaExtra) / (sectors.length - 1);
      for(var i = 0;i < sectors.length - 1;i++) {
        sectors[i].phi = phi;
        sectors[i].delta = deltaSector;
        sectors[i].originalAttr.phi = sectors[i].phi;
        sectors[i].originalAttr.delta = sectors[i].delta;
        phi += deltaSector
      }
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
  socialCheesecake.Cheesecake.prototype.getChanges = function() {
    return this.changes
  };
  socialCheesecake.Cheesecake.prototype.fanInSector = function(sector, open) {
    var sectors = this.sectors;
    var minDelta = Math.PI / 5;
    var prevSectorIndex = 0;
    var laterSectorIndex = 0;
    var deltaToChange = 0;
    if(open && sector.delta >= minDelta) {
      return
    }
    for(var i = 0;i < sectors.length;i++) {
      if(sectors[i] === sector) {
        prevSectorIndex = i - 1;
        laterSectorIndex = i + 1
      }
    }
    if(prevSectorIndex < 0) {
      prevSectorIndex = sectors.length - 1
    }
    if(laterSectorIndex >= sectors.length) {
      laterSectorIndex = 0
    }
    if(open) {
      deltaToChange = (minDelta - sector.delta) / 2;
      sector.resizeDelta({anchor:"m", delta:minDelta});
      console.log("delta to change " + deltaToChange);
      console.log("delta of prev " + sectors[prevSectorIndex].delta);
      console.log("delta of later " + sectors[laterSectorIndex].delta);
      sectors[prevSectorIndex].resizeDelta({anchor:"b", delta:sectors[prevSectorIndex].delta - deltaToChange});
      sectors[laterSectorIndex].resizeDelta({anchor:"e", delta:sectors[laterSectorIndex].delta - deltaToChange})
    }else {
      sector.resizeDelta({anchor:"m", delta:sector.originalAttr.delta});
      sectors[prevSectorIndex].resizeDelta({anchor:"b", delta:sectors[prevSectorIndex].originalAttr.delta});
      sectors[laterSectorIndex].resizeDelta({anchor:"e", delta:sectors[laterSectorIndex].originalAttr.delta})
    }
  };
  socialCheesecake.Cheesecake.getSectorFillColor = function() {
    return sectorFillColor
  };
  socialCheesecake.Cheesecake.setSectorFillColor = function(newColor) {
    if(typeof newColor === "string") {
      sectorFillColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getExtraSectorFillColor = function() {
    return extraSectorFillColor
  };
  socialCheesecake.Cheesecake.setExtraSectorFillColor = function(newColor) {
    if(typeof newColor === "string") {
      extraSectorFillColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getGreySectorFillColor = function() {
    return greySectorFillColor
  };
  socialCheesecake.Cheesecake.setGreySectorFillColor = function(newColor) {
    if(typeof newColor === "string") {
      greySectorFillColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getSectorFocusColor = function() {
    return sectorFocusColor
  };
  socialCheesecake.Cheesecake.setSectorFocusColor = function(newColor) {
    if(typeof newColor === "string") {
      sectorFocusColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getExtraSectorFocusColor = function() {
    return extraFocusColor
  };
  socialCheesecake.Cheesecake.setExtraSectorFocusColor = function(newColor) {
    if(typeof newColor === "string") {
      extraFocusColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getGreySectorFocusColor = function() {
    return greyFocusColor
  };
  socialCheesecake.Cheesecake.setGreySectorFocusColor = function(newColor) {
    if(typeof newColor === "string") {
      greyFocusColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getSectorHoverColor = function() {
    return sectorHoverColor
  };
  socialCheesecake.Cheesecake.setSectorHoverColor = function(newColor) {
    if(typeof newColor === "string") {
      sectorHoverColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getExtraSectorHoverColor = function() {
    return extraHoverColor
  };
  socialCheesecake.Cheesecake.setExtraSectorHoverColor = function(newColor) {
    if(typeof newColor === "string") {
      extraHoverColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getGreySectorHoverColor = function() {
    return greyHoverColor
  };
  socialCheesecake.Cheesecake.setGreySectorHoverColor = function(newColor) {
    if(typeof newColor === "string") {
      greyHoverColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getSectorTextAndStrokeColor = function() {
    return sectorTextAndStrokeColor
  };
  socialCheesecake.Cheesecake.setSectorTextAndStrokeColor = function(newColor) {
    if(typeof newColor === "string") {
      sectorTextAndStrokeColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getExtraSectorTextAndStrokeColor = function() {
    return extraTextAndStrokeColor
  };
  socialCheesecake.Cheesecake.setExtraSectorTextAndStrokeColor = function(newColor) {
    if(typeof newColor === "string") {
      extraTextAndStrokeColor = newColor
    }
  };
  socialCheesecake.Cheesecake.getGreySectorTextAndStrokeColor = function() {
    return greyTextAndStrokeColor
  };
  socialCheesecake.Cheesecake.setGreySectorTextAndStrokeColor = function(newColor) {
    if(typeof newColor === "string") {
      greyTextAndStrokeColor = newColor
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
      if(actors[i].isSelected()) {
        selectedActors.push(actors[i])
      }
    }
    return selectedActors
  };
  socialCheesecake.Grid.prototype.getShownActors = function() {
    var actors = this.actors;
    var shownActors = [];
    for(var i in actors) {
      if(!actors[i].isHidden() && !actors[i].isFiltered()) {
        shownActors.push(actors[i])
      }
    }
    return shownActors
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
  socialCheesecake.Grid.prototype.hide = function(actor_ids, ignoreSelected) {
    var actor;
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        actor = actor_ids[i];
        if(!(actor instanceof socialCheesecake.Actor)) {
          actor = this.getActor(actor)
        }
        if(!actor.isSelected() || ignoreSelected) {
          actor.hide()
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
  };
  socialCheesecake.Grid.prototype.fadeOut = function(actor_ids, time, modifyDisplay, ignoreSelected) {
    var actor;
    if(actor_ids instanceof Array) {
      for(var i in actor_ids) {
        actor = actor_ids[i];
        if(!(actor instanceof socialCheesecake.Actor)) {
          actor = this.getActor(actor)
        }
        if(!actor.isSelected() || ignoreSelected) {
          actor.fadeOut(time, modifyDisplay)
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
      for(var i in actor_ids) {
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
    var defaultSettings = {center:{x:0, y:0}, rIn:0, rOut:300, delta:Math.PI / 2, phi:0, label:"", color:socialCheesecake.Cheesecake.getSectorFillColor(), textAndStrokeColor:socialCheesecake.Cheesecake.getSectorTextAndStrokeColor(), mouseover:{color:socialCheesecake.Cheesecake.getSectorHoverColor()}, mouseout:{color:socialCheesecake.Cheesecake.getSectorFillColor()}, mouseup:{color:socialCheesecake.Cheesecake.getSectorFillColor()}, mousedown:{color:socialCheesecake.Cheesecake.getSectorFocusColor()}, 
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
    this.textAndStrokeColor = settings.textAndStrokeColor;
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
        var subsector = new socialCheesecake.Subsector({id:settings.subsectors[i].id, label:settings.subsectors[i].name, parent:this, x:this.x, y:this.y, phi:this.phi, delta:this.delta, rIn:rInSubsector, rOut:rOutSubsector, actors:settings.subsectors[i].actors, mouseover:{color:socialCheesecake.Cheesecake.getSectorHoverColor(), callback:function(subsector) {
          for(var i in subsector.parent.subsectors) {
            subsector.parent.subsectors[i].getRegion().removeEventListener("mouseout");
            if(subsector.parent.subsectors[i] != subsector) {
              subsector.parent.subsectors[i].changeColor(subsector.parent.subsectors[i].mouseout.color)
            }
          }
          subsector.getRegion().addEventListener("mouseout", function() {
            subsector.eventHandler("mouseout")
          });
          document.body.style.cursor = "pointer";
          subsector.getCheesecake().grid.hideAll();
          subsector.getCheesecake().grid.fadeIn(subsector.actors, 300, true);
          subsector.getCheesecake().setHighlightedSector(subsector)
        }}, mouseout:{color:socialCheesecake.Cheesecake.getSectorFillColor(), callback:function(subsector) {
          document.body.style.cursor = "default";
          subsector.getCheesecake().grid.fadeIn(subsector.parent.actors, 300, true);
          subsector.getCheesecake().setHighlightedSector(subsector.parent)
        }}, mousedown:{callback:function(subsector) {
          var selectedActors = subsector.getCheesecake().grid.getSelectedActors();
          subsector.changeMembership(selectedActors)
        }}});
        rInSubsector = rOutSubsector;
        this.subsectors.push(subsector)
      }
    }
    this.originalAttr = {x:this.x, y:this.y, phi:this.phi, delta:this.delta, rIn:this.rIn, rOut:this.rOut, color:this.color, textAndStrokeColor:this.textAndStrokeColor, label:this.label, mouseover:this.mouseover, mouseout:this.mouseout, mousedown:this.mousedown, mouseup:this.mouseup, simulate:this.simulate, subsectors:this.subsectors, auxiliar:this.auxiliar};
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
    var textAndStrokeColor = this.textAndStrokeColor;
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
    context.strokeStyle = textAndStrokeColor;
    context.stroke();
    if(this.auxiliar && label == "+") {
      socialCheesecake.text.addPlusCharacter(context, x, y, 0.5 * (rOut - rIn) + rIn, phi, delta, textAndStrokeColor)
    }else {
      socialCheesecake.text.writeCurvedText(label, context, x, y, 0.7 * (rOut - rIn) + rIn, phi, delta, textAndStrokeColor)
    }
    if(!this.auxiliar) {
      socialCheesecake.text.writeCurvedText("(" + actors.length + ")", context, x, y, 0.55 * (rOut - rIn) + rIn, phi, delta, textAndStrokeColor)
    }
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
    var parts = subsectors.length * 2 + 1;
    var subsectorRIn = rIn;
    var extraWidth = (rOut - rIn) * 0.06;
    var sectorWidth = (rOut - rIn - (parts - subsectors.length) * extraWidth) / subsectors.length;
    var extraSettings = {x:cheesecake.center.x, y:cheesecake.center.y, delta:delta, phi:phi, label:"+", parent:this, auxiliar:true, color:socialCheesecake.Cheesecake.getExtraSectorFillColor(), mouseover:{color:socialCheesecake.Cheesecake.getExtraSectorHoverColor(), callback:function(sector) {
      sector.resizeWidth({width:extraWidth * 1.5, anchor:"m", step:1})
    }}, mouseout:{color:socialCheesecake.Cheesecake.getExtraSectorFillColor(), callback:function(sector) {
      sector.resizeWidth({width:extraWidth, anchor:"m", step:1, priority:true})
    }}};
    for(var i in subsectors) {
      rIn += extraWidth;
      subsectors[i].rIn = rIn;
      subsectors[i].rOut = rIn + sectorWidth;
      subsectors[i].phi = phi;
      subsectors[i].delta = delta;
      cheesecake.stage.add(subsectors[i].getRegion());
      rIn += sectorWidth
    }
    rIn = 0;
    for(var i = 0;i < parts - subsectors.length;i++) {
      if(i == 0) {
        var extraSettingsFirst = {x:cheesecake.center.x, y:cheesecake.center.y, rIn:rIn, rOut:rIn + extraWidth, delta:delta, phi:phi, label:"+", parent:this, auxiliar:true, color:socialCheesecake.Cheesecake.getExtraSectorFillColor(), mouseover:{color:socialCheesecake.Cheesecake.getExtraSectorHoverColor(), callback:function(sector) {
          sector.resizeWidth({width:extraWidth * 1.5, anchor:"rin", step:1})
        }}, mouseout:{color:socialCheesecake.Cheesecake.getExtraSectorFillColor(), callback:function(sector) {
          sector.resizeWidth({width:extraWidth, anchor:"rin", step:1, priority:true})
        }}};
        var extraSector = new socialCheesecake.Subsector(extraSettingsFirst)
      }else {
        extraSettings["rIn"] = rIn;
        extraSettings["rOut"] = rIn + extraWidth;
        var extraSector = new socialCheesecake.Subsector(extraSettings)
      }
      cheesecake.stage.add(extraSector.getRegion());
      this.extraSubsectors.push(extraSector);
      rIn += extraWidth + sectorWidth
    }
  };
  socialCheesecake.Sector.prototype.putTogether = function() {
    var cheesecake = this.getCheesecake();
    var sector = this.simulate != null ? cheesecake.sectors[this.simulate] : this;
    var subsectors = sector.subsectors;
    var extraSubsectors = this.extraSubsectors;
    for(var i = extraSubsectors.length;i > 0;i--) {
      cheesecake.stage.remove(extraSubsectors.pop().getRegion())
    }
    for(var i in subsectors) {
      cheesecake.stage.remove(subsectors[i].getRegion())
    }
  };
  socialCheesecake.Sector.prototype.changeColor = function(color) {
    var sector = this;
    if(sector.getRegion().layer) {
      var context = sector.getRegion().layer.getContext();
      var stage = sector.getCheesecake().stage;
      sector.color = color;
      context.restore();
      context.save();
      stage.draw()
    }
  };
  socialCheesecake.Sector.prototype.resizeDelta = function(options) {
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
    console.log("resizing delta of sector " + sector.label);
    console.log("current delta " + currentDelta);
    console.log("delta to achieve " + goalDelta);
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
        sector.resizeDelta(options)
      })
    }else {
      if(options.callback) {
        options.callback()
      }
    }
  };
  socialCheesecake.Sector.prototype.resizeWidth = function(options) {
    var sector = this;
    var context = sector.getRegion().layer.getContext();
    var stage = sector.getCheesecake().stage;
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
    var context = sector.getRegion().layer.getContext();
    var stage = sector.getCheesecake().stage;
    sector.rOut = sector.originalAttr.rOut * 1.05;
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
    if(settings.textAndStrokeColor) {
      this.textAndStrokeColor = settings.textAndStrokeColor
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
        var actor_info = {id:settings.actors[actor][0], name:settings.actors[actor][1]};
        this.addActor(actor_info, this)
      }
    }
  };
  socialCheesecake.Subsector.prototype = new socialCheesecake.Sector({id:this.id, parent:this.parent, center:{x:this.x, y:this.y}, label:this.label, rIn:this.rIn, rOut:this.rOut, phi:this.phi, delta:this.delta, auxiliar:this.auxiliar, color:this.color, textAndStrokeColor:this.textAndStrokeColor, mouseover:this.mouseover, mouseout:this.mouseout, mouseup:this.mouseup, mousedown:this.mousedown});
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
      this.getCheesecake().updateActorMembership(actors[i].id);
      isMember = false
    }
    this.getCheesecake().calculatePortions()
  }
})();
var socialCheesecake = socialCheesecake || {};
(function() {
  socialCheesecake.text = {addPlusCharacter:function(context, x, y, r, phi, delta, color) {
    context.font = "bold 14px sans-serif";
    context.fillStyle = color || "#000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    text = "+";
    context.translate(x, y);
    context.rotate(-delta / 2 - phi - Math.PI / 2);
    context.fillText(text[0], 0, r);
    context.restore();
    context.save()
  }, writeCurvedText:function(text, context, x, y, r, phi, delta, color) {
    context.font = "bold 14px sans-serif";
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

