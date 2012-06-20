var socialCheesecake = socialCheesecake || {};
(function() {
	socialCheesecake.Cheesecake = function(cheesecakeData, callback) {
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
		cheesecake.auxiliarSectors = [];
		cheesecake.stage = new Kinetic.Stage({
			container: cheesecakeData.container.id,
			width: cheesecakeData.container.width,
			height: cheesecakeData.container.height

		});
		cheesecake.stage.add(new Kinetic.Layer({name: "main"}));
		cheesecake.grid = new socialCheesecake.Grid({
			parent : this,
			grid_id : cheesecakeData.grid.id,
			divIdPrefix : cheesecakeData.grid.divIdPrefix || "actor_",
			maxOpacity : cheesecakeData.grid.maxOpacity || 1,
			minOpacity : cheesecakeData.grid.minOpacity || 0
		});
		cheesecake.matchActorsNumber = cheesecakeData.match;
		if(cheesecake.matchActorsNumber === null) cheesecake.matchActorsNumber = true;

		cheesecake._initialState = {};
		cheesecake._changes = {};

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
		//Callback settings
		if(cheesecakeData.callbacks){
			for(var type in cheesecakeData.callbacks) {
				socialCheesecake.eventCallbackHandlers[type] = cheesecakeData.callbacks[type];
			}
		}
		cheesecake.syncSectorFocusCallbacks = cheesecake.syncSectorFocusCallbacks || false;

		if (jsonSectors.length === 0) {
			var blackSector = cheesecake.newSector({
				parent : cheesecake,
				center : cheesecake.center,
				rOut : cheesecake.rMax,
				color : socialCheesecake.colors.blackSector.background,
				label : "",
				auxiliar : true,
				type : "blackSector"
			});

			cheesecake.sectors[0] = blackSector;
		}

		//Extra sector if necessary
		if(jsonSectors.length < 16) {
			var pos = jsonSectors.length;
			if (pos === 0)
				pos = 1;

			var extraSector = cheesecake.newSector({
				label : "+",
				color : socialCheesecake.colors.extraSector.background,
				auxiliar : true,
				type : "extraSector"
			});

			cheesecake.sectors[pos] = extraSector;
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

		if (typeof callback == "function") {
			callback(this);
		}
	};

	socialCheesecake.Cheesecake.prototype.draw = function() {
		var sectors = this.sectors;
		this.addToLayer(sectors);
		this.stage.draw();
	};

	socialCheesecake.Cheesecake.prototype.disable = function() {
		var layers = this.stage.getChildren();
		for(var layer in layers) {
			layers[layer].listen(false);
		}
	};

	socialCheesecake.Cheesecake.prototype.enable = function() {
		var layers = this.stage.getChildren();
		for(var layer in layers) {
			layers[layer].listen(true);
		}
	};

	socialCheesecake.Cheesecake.prototype.saved = function() {
		this.saveState();
		this.enable();
	};

	socialCheesecake.Cheesecake.prototype.focusAndBlurCheesecake = function(sector) {
		var cheesecake = this;
		var sectorIndex;
		var onSectorFocusBegin = socialCheesecake.eventCallbackHandlers.onSectorFocusBegin;

		// hack remove black sector
		if (cheesecake.sectors[0].type === "blackSector")
			cheesecake.sectors.shift();

		for(var i in cheesecake.sectors) {
			if(cheesecake.sectors[i] === sector)
				sectorIndex = i;
		}
		if(sectorIndex == null)
			throw "sector doesn't belong to this cheesecake"
		cheesecake.clearLayer();
		cheesecake.setHighlightedSector(sector);
		cheesecake.disable();

		//Add auxiliar sectors
		var greySettings = {
			parent : cheesecake,
			center : cheesecake.center,
			phi : sector.phi + sector.delta,
			delta : 2 * Math.PI - sector.delta,
			rOut : cheesecake.rMax,
			color : socialCheesecake.colors.greySector.background,
			label : "",
			auxiliar : true,
			type : "greySector"
		};
		var greySector = new socialCheesecake.Sector(greySettings);
		cheesecake.auxiliarSectors.push(greySector);
		var dummySector = this.getAuxiliarClone(sectorIndex);

		cheesecake.addToLayer(greySector);
		cheesecake.addToLayer(dummySector);
		//Animations
		var greyResizeCallback = function() {
			greySector.changeProperty("label", "BACK");
			cheesecake.enable();
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
			if(onSectorFocusBegin) {
				if(cheesecake.syncSectorFocusCallbacks) {
					onSectorFocusBegin(cheesecake, callback);
				} else {
					onSectorFocusBegin(cheesecake);
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
		var mainLayer = this.stage.getChildren("main")[0];
		var regions = mainLayer.getChildren();

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
		var onSectorUnfocusEnd = socialCheesecake.eventCallbackHandlers.onSectorUnfocusEnd;
		var onSectorUnfocusBegin = socialCheesecake.eventCallbackHandlers.onSectorUnfocusBegin;
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
					if(onSectorUnfocusEnd) {
						onSectorUnfocusEnd(cheesecake);
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
		if(onSectorUnfocusBegin) {
			if(cheesecake.syncSectorFocusCallbacks) {
				onSectorUnfocusBegin(cheesecake, actions);
			} else {
				onSectorUnfocusBegin(cheesecake);
				actions();
			}
		} else {
			actions();
		}
	};

	socialCheesecake.Cheesecake.prototype.newSector = function(settings) {
		settings = settings || {};
		settings.parent = this;
		settings.center = this.center;
		// Do we really need id?
		//settings.id = this.getInitialState().sectors.length;
		settings.rOut = this.rMax;

		return new socialCheesecake.Sector(settings);
	};

	socialCheesecake.Cheesecake.prototype.addNewSector = function(settings) {
		var newSector = this.newSector(settings);

		this.sectors.push(this.sectors[this.sectors.length - 1]);
		this.sectors[this.sectors.length - 2 ] = newSector;

//		cheesecake.calculatePortions();


	};

	/*
	 * Add new Subsector to the Focused Sector
	 */
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
		changes.actors = changes.actors || [];
		var changesInActors = changes.actors;
		var alreadyChanged = false;
		var actorId = actor.id;
		var actorParents = actor.getParentsIds();
		var actorName = actor.name;
		var actorExtraInfo = actor.extraInfo;
		var onChange = socialCheesecake.eventCallbackHandlers.onChange;

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
		//Execute onChange Callback
		if(onChange) onChange(this);
	}
	
	/*
	 * Executes when a sector is removed / added and/or subsectors are added or removed from them
	 */
	socialCheesecake.Cheesecake.prototype.updateSectorChanges = function(sector){
		var changes = this._changes;
		changes.sectors = changes.sectors || [];
		var changesInSectors = changes.sectors;
		var alreadyChanged = false;
		for(var s in changesInSectors){
			if(changesInSectors[s].id == sector.id){
				alreadyChanged = true;
				changesInSectors[s].subsectors = sector.getSubsectorsIds();
				changesInSectors[s].name = sector.label;
			}
		}if(!alreadyChanged){
			changesInSectors.push({
				id : sector.id,
				subsectors : sector.getSubsectorsIds(),
				name : sector.label
			});
		}
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
		var layer = layer || this.stage.getChildren("main")[0];
		if(sectors instanceof Array){
			for(var sector in sectors){
				layer.add(sectors[sector].getRegion());
			}
		}else{
			layer.add(sectors.getRegion());
		}
	}
	
	socialCheesecake.Cheesecake.prototype.removeFromLayer = function(sectors, layer){
		var layer = layer || this.stage.getChildren("main")[0];
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
	
	socialCheesecake.Cheesecake.prototype.drawLayer = function(layer, initialContextState){
		var layer = layer || this.stage.getChildren("main")[0];
		initialContextState = (initialContextState != null)? initialContextState : true;
		if(initialContextState){
			var context = layer.getContext();
			context.restore();
			context.save();
		}
		layer.draw();
	}
	
	socialCheesecake.Cheesecake.prototype.clearLayer = function(layer){
		var layer = layer || this.stage.getChildren("main")[0];
		var regions = layer.getChildren();
		for(var i = (regions.length - 1); i >= 0; i--) {
			layer.remove(regions[i]);
		}
		layer.clear();
	}

	socialCheesecake.Cheesecake.prototype.setHighlightedSector = function(sector) {
		var onSectorHighlight = socialCheesecake.eventCallbackHandlers.onSectorHighlight;
		if(this.highlightedSector != sector) {
			this.highlightedSector = sector;
			if(onSectorHighlight) onSectorHighlight(this);
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
	
	socialCheesecake.Cheesecake.prototype.getCurrentState = function() {
		var state = [];

		for (var s in this.sectors) {
			var sector = this.sectors[s];

			if (sector.type !== "normalSector")
				continue;

			var jsonSector = state[s] = {};

			jsonSector.id = sector.id;
			jsonSector.label = sector.label;
			jsonSector.subsectors = [];

			for (var ss in sector.subsectors) {
				var subsector = sector.subsectors[ss];
				var jsonSubsector = jsonSector.subsectors[ss] = {};

				jsonSubsector.id = subsector.id;
				jsonSubsector.label = subsector.label;
				jsonSubsector.actors = [];

				for (var ac in subsector.actors) {
					jsonSubsector.actors.push(subsector.actors[ac].id);
				}
			}
		}

		return state;
	};

	socialCheesecake.Cheesecake.prototype.saveState = function() {
		//TODO: save initalstate
		this._changes = {};
	};

	socialCheesecake.Cheesecake.prototype.filter = function(pattern) {
		console.log("search");
		var grid = this.grid;
		var highlightedSector = this.highlightedSector;
		socialCheesecake.SearchEngine.filter(pattern, grid.actors);
		if(highlightedSector) {
			grid.fadeIn(highlightedSector.actors, 100, true);
		} else {
			grid.fadeIn(grid.actors, 100, true);
		}
	}

	socialCheesecake.Cheesecake.prototype._setInitialState = function() {
		var state = this._initialState;
		var actors = this.grid.actors;
		var sectors = this.sectors;

		state.actors = [];
		for(var actor in actors){
			state.actors.push({
				id : actors[actor].id,
				subsectors : actors[actor].getParentsIds(),
				name : actors[actor].name,
				extraInfo : actors[actor].extraInfo
			});
		}
		state.sectors = [];
		for(var sector in sectors){
			if(sectors[sector].type == "normalSector"){
				state.sectors.push({
					id : sectors[sector].id,
					name : sectors[sector].label,
					subsectors : sectors[sector].getSubsectorsIds()
				});
			}
		}
	}
})();
