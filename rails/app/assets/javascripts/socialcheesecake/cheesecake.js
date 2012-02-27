var socialCheesecake = socialCheesecake || {};
(function() {
	socialCheesecake.Cheesecake = function(cheesecakeData) {
		var jsonSectors = cheesecakeData.sectors;
		var cheesecake = this;
		//Properties
		cheesecake.center = {
			x : cheesecakeData.center.x,
			y : cheesecakeData.center.y
		};
		cheesecake.rMax = cheesecakeData.rMax;
		cheesecake.sectors = [];
		cheesecake.highlightedSector = null;
		cheesecake.onSectorHighlight = cheesecakeData.onSectorHighlight || null;
		cheesecake.onSubsectorAdded = cheesecakeData.onSubsectorAdded || null;
		cheesecake.onSectorFocusBegin = cheesecakeData.onSectorFocusBegin || null;
		cheesecake.onSectorFocusEnd = cheesecakeData.onSectorFocusEnd || null;
		cheesecake.onSectorUnfocusBegin = cheesecakeData.onSectorUnfocusBegin || null;
		cheesecake.onSectorUnfocusEnd = cheesecakeData.onSectorUnfocusEnd || null;
		cheesecake.syncSectorFocusCallbacks = cheesecake.syncSectorFocusCallbacks || false;
		cheesecake.auxiliarSectors = [];
		cheesecake.stage = new Kinetic.Stage(cheesecakeData.container.id, cheesecakeData.container.width, cheesecakeData.container.height);
		cheesecake.stage.add(new Kinetic.Layer());
		cheesecake.stage.mainLayer = cheesecake.stage.layers[0];
		cheesecake.grid = new socialCheesecake.Grid({
			parent : this,
			grid_id : cheesecakeData.grid.id,
			divIdPrefix : cheesecakeData.grid.divIdPrefix || "actor_",
			maxOpacity : cheesecakeData.grid.maxOpacity || 1,
			minOpacity : cheesecakeData.grid.minOpacity || 0
		});
		cheesecake.searchEngine = new socialCheesecake.SearchEngine({
			parent : this
		});
		cheesecake.matchActorsNumber = cheesecakeData.match;
		if(cheesecake.matchActorsNumber == null)
			cheesecake.matchActorsNumber = true;
		cheesecake._initialState = {};
		cheesecake._changes = {};
		cheesecake.onChange = function(cheesecake) {
		};
		if(cheesecakeData.onChange)
			cheesecake.onChange = cheesecakeData.onChange;
		//Text settings
		if(cheesecakeData.text) {
			for(var style in cheesecakeData.text) {
				socialCheesecake.text[style] = cheesecakeData.text[style];
			}
		}
		//Color settings
		if(cheesecakeData.colors) {
			for(var type in cheesecakeData.colors) {
				for(var color in cheesecakeData.colors[type]) {
					socialCheesecake.colors[type][color] = cheesecakeData.colors[type][color];
				}
			}
		}
		//Extra sector if necessary
		if(jsonSectors.length < 16) {
			var extraSector = new socialCheesecake.Sector({
				parent : cheesecake,
				center : cheesecake.center,
				label : "+",
				rOut : cheesecakeData.rMax,
				color : socialCheesecake.colors.extraSector.background,
				subsectors : [{
					name : "New Subsector 1"
				}],
				auxiliar : true,
				type : "extraSector"
			});
			cheesecake.sectors[jsonSectors.length] = extraSector;
		}
		var minNumSectors = Math.min(jsonSectors.length, 16);
		for(var i = 0; i < minNumSectors; i++) {
			var settings = {
				parent : cheesecake,
				center : cheesecake.center,
				id : jsonSectors[i].id,
				label : jsonSectors[i].name,
				rOut : cheesecakeData.rMax,
				subsectors : jsonSectors[i].subsectors,
				type : "normalSector"
			};
			cheesecake.sectors[i] = new socialCheesecake.Sector(settings);
		}
		cheesecake.calculatePortions();
		cheesecake._setInitialState();
		cheesecake.draw();
	}

	socialCheesecake.Cheesecake.prototype.draw = function() {
		var sectors = this.sectors;
		this.addToLayer(sectors);
		this.stage.draw();
	}

	socialCheesecake.Cheesecake.prototype.disable = function() {
		var layers = this.stage.layers;
		for(var layer in layers) {
			layers[layer].listen(false);
		}
	}

	socialCheesecake.Cheesecake.prototype.enable = function() {
		var layers = this.stage.layers;
		for(var layer in layers) {
			layers[layer].listen(true);
		}
	}

	socialCheesecake.Cheesecake.prototype.focusAndBlurCheesecake = function(sector) {
		var cheesecake = this;
		var sectorIndex;
		for(var i in cheesecake.sectors) {
			if(cheesecake.sectors[i] === sector)
				sectorIndex = i;
		}
		if(sectorIndex == null)
			throw "sector doesn't belong to this cheesecake"
		cheesecake.clearLayer();
		cheesecake.setHighlightedSector(sector);

		//Add auxiliar sectors
		var greySettings = {
			parent : cheesecake,
			center : cheesecake.center,
			phi : sector.phi + sector.delta,
			delta : 2 * Math.PI - sector.delta,
			rOut : cheesecake.rMax,
			color : socialCheesecake.colors.greySector.background,
			auxiliar : true,
			type : "greySector"
		};
		var greySector = new socialCheesecake.Sector(greySettings);
		cheesecake.auxiliarSectors.push(greySector);
		var dummySector = this.getAuxiliarClone(sectorIndex);

		cheesecake.addToLayer(greySector);
		cheesecake.addToLayer(dummySector);
		//Animations
		var greyClickCallback = function() {
			greySector.label = "";
			cheesecake.unfocusAndUnblurCheesecake();
		};
		var greyResizeCallback = function() {
			greySector.click = {
				callback : greyClickCallback
			}
			greySector.label = "GO BACK";
		};
		var greyRotateToCallback = function() {
			greySector.resizeDelta({
				delta : 3 * Math.PI / 2,
				anchor : "M",
				callback : greyResizeCallback
			});
		};
		var dummyResizeCallback = function() {
			var grid = cheesecake.grid;
			grid.hideAll();
			grid.show(cheesecake.sectors[sectorIndex].actors);
			dummySector.splitUp();
		};
		var dummyRotateToCallback = function() {
			var callback = function() {
				dummySector.resizeDelta({
					anchor : "M",
					callback : dummyResizeCallback
				});
			}
			if(cheesecake.onSectorFocusBegin) {
				if(cheesecake.syncSectorFocusCallbacks) {
					cheesecake.onSectorFocusBegin(cheesecake, callback);
				} else {
					cheesecake.onSectorFocusBegin(cheesecake);
					callback();
				}
			} else {
				callback();
			}
		};
		greySector.rotateTo({
			destination : 5 * Math.PI / 4,
			callback : greyRotateToCallback,
			anchor : "M"
		});

		dummySector.rotateTo({
			destination : Math.PI / 4,
			callback : dummyRotateToCallback,
			anchor : "M"
		});
	}
	socialCheesecake.Cheesecake.prototype.recoverCheesecake = function() {
		var cheesecake = this;
		var lastSector = this.highlightedSector;
		var mainLayer = this.stage.mainLayer;
		var regions = mainLayer.getShapes();

		//Delete the auxiliar sectors
		cheesecake.removeFromLayer(cheesecake.auxiliarSectors);
		cheesecake.auxiliarSectors = [];
		mainLayer.clear();

		// Add the former sectors and actors
		cheesecake.draw();
		if(lastSector) {
			lastSector.color = lastSector.originalAttr.color;
			lastSector.fan(false);
			lastSector.unfocus();
			this.setHighlightedSector(null);
		}
	}
	socialCheesecake.Cheesecake.prototype.unfocusAndUnblurCheesecake = function() {
		var cheesecake = this;
		var auxiliarSectors = this.auxiliarSectors;
		var dummySector;
		var sectorNewDelta;
		var sectorNewPhi;
		var greySector;
		var actions = function() {
			//Localize the dummy and grey sectors
			for(var i in auxiliarSectors) {
				if(auxiliarSectors[i].simulate != null) {
					var options = {
						phi : auxiliarSectors[i].phi,
						delta : auxiliarSectors[i].delta,
						rOut : auxiliarSectors[i].rOut
					};
					dummySector = cheesecake.getAuxiliarClone(auxiliarSectors[i].simulate, options);
				} else {
					greySector = auxiliarSectors[i];
				}
			}

			//Animate and go back to the general view
			dummyNewDelta = cheesecake.sectors[dummySector.simulate].delta;
			dummyNewPhi = cheesecake.sectors[dummySector.simulate].phi;
			dummySector.putTogether();
			dummySector.resizeDelta({
				anchor : "M",
				delta : dummyNewDelta,
				callback : function() {
					if(cheesecake.onSectorUnfocusEnd) {
						cheesecake.onSectorUnfocusEnd(cheesecake);
					}
					cheesecake.grid.showAll();
					dummySector.rotateTo({
						destination : dummyNewPhi
					});
				}
			});
			greySector.resizeDelta({
				anchor : "M",
				delta : (2 * Math.PI) - dummyNewDelta,
				callback : function() {
					greySector.rotateTo({
						destination : dummyNewPhi + dummyNewDelta,
						callback : function() {
							cheesecake.recoverCheesecake();
						}
					});
				}
			});
		}
		if(cheesecake.onSectorUnfocusBegin) {
			if(cheesecake.syncSectorFocusCallbacks) {
				cheesecake.onSectorUnfocusBegin(cheesecake, actions);
			} else {
				cheesecake.onSectorUnfocusBegin(cheesecake);
				actions();
			}
		} else {
			actions();
		}
	}
	
	socialCheesecake.Cheesecake.prototype.addNewSector = function() {
		var cheesecake = this;
		var sectors = this.sectors;	
		var newSector;
		var settings = {
			parent : cheesecake,
			center : cheesecake.center,
			/*id : jsonSectors[i].id,*/
			label : "New Sector",
			rOut : cheesecake.rMax,
			subsectors : [{name : "New Subsector 1"}]
		};
		//move the extra sector to its new position, create new sector.
		sectors.push(sectors[sectors.length-1]);
		newSector = new socialCheesecake.Sector(settings);
		cheesecake.sectors[sectors.length-2] = newSector;
		cheesecake.calculatePortions();
	}
	
	socialCheesecake.Cheesecake.prototype.addNewSubsector = function(subsectorIndex){
		var cheesecake = this;
		var sector = this.getFocusedSector();
		if(sector == null) return;
		if(subsectorIndex > sector.subsectors.length ){
			console.log("Cannot add new subsector in position "+ subsectorIndex+".This sector only has "+sector.subsectors.length+" subsectors");
			return;
		}
		sector.turnExtraIntoNewSubsector(subsectorIndex);
	}
	
	/**
	 * actorId 		- actor which changes one of its parents
	 */
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
			changesInActors = changes.actors
			for(var a in changesInActors) {
				if(changesInActors[a].id == actorId) {
					alreadyChanged = true;
					changesInActors[a].subsectors = actorParents;
				}
			}
			if(!alreadyChanged) {
				changesInActors.push({
					id : actorId,
					subsectors : actorParents,
					name : actorName,
					extraInfo : actorExtraInfo,
					justAdded : false
				});
			}
		} else {
			changes.actors = [];
			changes.actors.push({
				id : actorId,
				subsectors : actorParents,
				name : actorName,
				extraInfo : actorExtraInfo,
				justAdded : false
			});
		}
		//Execute onChange Callback
		onChange(this);
	}

	socialCheesecake.Cheesecake.prototype.calculatePortions = function() {
		var sectors = this.sectors;
		var match = this.matchActorsNumber;
		var deltaExtra = Math.PI / 8;
		var minDeltaSector = Math.PI / 8;
		var phi = ((5 * Math.PI) / 4) - (deltaExtra / 2);
		var sectorActors = [];
		var sectorPortions = [];
		var totalSectors = sectors.length;
		var totalActors = 0;
		var totalAngle = 2 * Math.PI;
		var unusedAngle;

		//Begin with the extra Sector, if it exists
		if(sectors[sectors.length - 1].auxiliar) {
			sectors[sectors.length - 1].phi = phi;
			sectors[sectors.length - 1].delta = deltaExtra;
			sectors[sectors.length - 1].originalAttr.phi = sectors[sectors.length - 1].phi;
			sectors[sectors.length - 1].originalAttr.delta = sectors[sectors.length - 1].delta;
			phi += deltaExtra;
			totalSectors = sectors.length - 1;
			totalAngle -= deltaExtra;
		}
		if(!match) {
			unusedAngle = 0;
		} else {
			unusedAngle = totalAngle - totalSectors * minDeltaSector
		}
		for(var i = 0; i < totalSectors; i++) {
			sectorActors[i] = sectors[i].actors.length;
			totalActors += sectorActors[i];
			sectorPortions[i] = minDeltaSector;
			if(!match)
				sectorPortions[i] = totalAngle / totalSectors;
		}
		for(var i = 0; i < totalSectors; i++) {
			if(totalActors != 0) {
				sectorPortions[i] += (sectorActors[i] / totalActors) * unusedAngle;
			} else {
				sectorPortions[i] = totalAngle / totalSectors;
			}
			sectors[i].phi = phi;
			sectors[i].delta = sectorPortions[i];
			sectors[i].originalAttr.phi = sectors[i].phi;
			sectors[i].originalAttr.delta = sectors[i].delta;
			phi += sectors[i].delta;
		}
	}
	
	socialCheesecake.Cheesecake.prototype.addToLayer = function(sectors, layer){
		var layer = layer || this.stage.mainLayer;
		if(sectors instanceof Array){
			for(var sector in sectors){
				layer.add(sectors[sector].getRegion());
			}
		}else{
			layer.add(sectors.getRegion());
		}
	}
	
	socialCheesecake.Cheesecake.prototype.removeFromLayer = function(sectors, layer){
		var layer = layer || this.stage.mainLayer;
		if(sectors instanceof Array){
			for(var sector in sectors) {
				try{
					layer.remove(sectors[sector].getRegion());
				}catch(e){
				}
			}
		}else{
			layer.remove(sectors.getRegion());
		}
	}
	
	socialCheesecake.Cheesecake.prototype.drawLayer = function(layer){
		var layer = layer || this.stage.mainLayer;
		layer.draw();
	}
	
	socialCheesecake.Cheesecake.prototype.clearLayer = function(layer){
		var layer = layer || this.stage.mainLayer;
		var regions = layer.getShapes();
		for(var i = (regions.length - 1); i >= 0; i--) {
			layer.remove(regions[i]);
		}
		layer.clear();
	}

	socialCheesecake.Cheesecake.prototype.setHighlightedSector = function(sector) {
		if(this.highlightedSector != sector) {
			this.highlightedSector = sector;
			if(this.onSectorHighlight) {
				this.onSectorHighlight(this);
			}
		}
	}
	
	socialCheesecake.Cheesecake.prototype.getAuxiliarClone = function(sectorIndex, options){
		var dummy = null;
		var cheesecake = this;
		var sector = null;
		var auxiliarSectors = cheesecake.auxiliarSectors;
		var settings = {};
		var options = options || {};
		//Localize the dummy sector
		for(var i in auxiliarSectors) {
			if(auxiliarSectors[i].simulate != null) {
				dummy = auxiliarSectors[i];
			}
		}	
		if( sectorIndex != null){
			sector = cheesecake.sectors[sectorIndex];
			settings = {
				phi : options.phi || sector.phi,
				delta : options.delta || sector.delta,
				rOut : options.rOut || sector.rOut,
				label : options.label || sector.label,
				borderColor : options.borderColor || socialCheesecake.colors[sector.type]["border"],
				color : options.color || sector.color,
				fontColor : options.fontColor || socialCheesecake.colors[sector.type]["font"],
				simulate : sectorIndex,
				auxiliar : true,
				type: "dummySector"
			}
			//if dummy doesnt exist, create a new one
			if(!dummy){ 
				dummy = new socialCheesecake.Sector({
					center : cheesecake.center,
					parent : cheesecake
				});
				this.auxiliarSectors.push(dummy);
			}
			for(var property in settings){
				dummy[property] = settings[property];
			}
		}
		return dummy;
	}
	
	socialCheesecake.Cheesecake.prototype.getFocusedSector = function(){
		var dummy = this.getAuxiliarClone();
		var sectors = this.sectors;
		var sector = null;
		if(dummy){
			sector = sectors[dummy.simulate];
		}
		return sector;
	}

	socialCheesecake.Cheesecake.prototype.getSectorById = function(id) {
		var sectors = this.sectors;
		var sector;
		for(var i in sectors) {
			if(sectors[i].id == id) {
				sector = sectors[i];
				break;
			}
		}
		return sector;
	}

	socialCheesecake.Cheesecake.prototype.getSubsectorById = function(id) {
		var sectors = this.sectors;
		var subsectors;
		var subsector;
		for(var i in sectors) {
			subsectors = sectors[i].subsectors;
			for(var j in subsectors) {
				if(subsectors[j].id == id) {
					subsector = subsectors[j];
					break;
				}
			}
		}
		return subsector;
	}

	socialCheesecake.Cheesecake.prototype.getChanges = function() {
		return this._changes;
	}

	socialCheesecake.Cheesecake.prototype.getInitialState = function() {
		return this._initialState;
	}

	socialCheesecake.Cheesecake.prototype._setInitialState = function() {
		var state = this._initialState;
		var actors = this.grid.actors;

		state.actors = [];
		for(var actor in actors ) {
			state.actors.push({
				id : actors[actor].id,
				subsectors : actors[actor].getParentsIds(),
				name : actors[actor].name,
				extraInfo : actors[actor].extraInfo
			})
		}
	}
})();
