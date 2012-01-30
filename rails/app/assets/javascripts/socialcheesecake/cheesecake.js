var socialCheesecake = socialCheesecake || {};
(function() {
	
	//General variable settings (with default values)
	socialCheesecake.colors = {
		normalSector : {
			background : "#eeffee", //normal, mouseout, mouseup states
			highlight : "#77ff77",	//click state	
			hover : "#aaffaa",			//mouseover state
			font : "#1F4A75",				//text
			border : "#1F4A75"			//stroke
		},
		extraSector : {
			background : "#e5e5e5",
			highlight : "#1FA0F7",
			hover : "#D4E4EA",
			font : "#1F4A75",
			border : "#1F4A75"
		},
		greySector : {
			background : "#f5f5f5",
			highlight : "#f5f5f5",
			hover : "#f5f5f5",
			font : "#666",
			border : "#666"
		}
	}

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
		cheesecake.onSectorFocusBegin = cheesecakeData.onSectorFocusBegin || null;
		cheesecake.onSectorFocusEnd = cheesecakeData.onSectorFocusEnd || null;
		cheesecake.syncSectorFocusCallbacks = cheesecake.syncSectorFocusCallbacks || false;
		cheesecake.auxiliarSectors = [];
		cheesecake.stage = new Kinetic.Stage(cheesecakeData.container.id, 
			cheesecakeData.container.width, cheesecakeData.container.height);
		cheesecake.stage.add(new Kinetic.Layer());
		cheesecake.stage.mainLayer = cheesecake.stage.layers[0];
		cheesecake.grid = new socialCheesecake.Grid({
			parent : this,
			grid_id : cheesecakeData.grid.id,
			divIdPrefix : cheesecakeData.grid.divIdPrefix || "actor_"
		});
		cheesecake.searchEngine = new socialCheesecake.SearchEngine({
			parent : this
		});
		cheesecake.matchActorsNumber = cheesecakeData.match;
		if(cheesecake.matchActorsNumber==null) cheesecake.matchActorsNumber = true;
		cheesecake._initialState = {};
		cheesecake._changes = {};
		cheesecake.onChange = function(cheesecake){};
		if(cheesecakeData.onChange)
			cheesecake.onChange = cheesecakeData.onChange;
		//Text settings
		if(cheesecakeData.text){
			for( var style in cheesecakeData.text){
				socialCheesecake.text[style]= cheesecakeData.text[style];
			}
		}
		//Color settings
		if(cheesecakeData.colors){
			for( var type in cheesecakeData.colors){
				for (var color in cheesecakeData.colors[type]){
					socialCheesecake.colors[type][color]= cheesecakeData.colors[type][color];
				}
			}
		}
		
		if(jsonSectors.length < 16){
			var extraSector = new socialCheesecake.Sector({
				parent : cheesecake,
				center : {
					x : cheesecakeData.center.x,
					y : cheesecakeData.center.y
				},
				label: "+",
				rOut : cheesecakeData.rMax,
				color : socialCheesecake.colors.extraSector.background,
				mouseover : {
					color : socialCheesecake.colors.extraSector.hover,
					callback : function(sector) {
						sector.focus();
						cheesecake.grid.hideAll();
					}
				},
				mouseout : {
					color : socialCheesecake.colors.extraSector.background,
					callback : function(sector) {
						sector.unfocus();
						cheesecake.grid.fadeInAll(300, true);
					}
				},
				mouseup : {color : socialCheesecake.colors.extraSector.background},
				click : {
					color : socialCheesecake.colors.extraSector.highlight
					/*callback : function(sector){
						cheesecake.focusAndBlurCheesecake(sector);
					}*/
				},
				subsectors : [{
					name : "New Subsector 1"
				}],
				auxiliar : true,
				fontColor : socialCheesecake.colors.extraSector.font,
				borderColor : socialCheesecake.colors.extraSector.border
			});
			cheesecake.sectors[jsonSectors.length] = extraSector;
		}
		var minNumSectors = Math.min(jsonSectors.length, 16);
		for(var i = 0; i < minNumSectors; i++) {			
			var settings = {
				parent : cheesecake,
				center : {
					x : cheesecakeData.center.x,
					y : cheesecakeData.center.y
				},
				id : jsonSectors[i].id,
				label : jsonSectors[i].name,
				rOut : cheesecakeData.rMax,
				subsectors : jsonSectors[i].subsectors,
				mouseover : {
					color : socialCheesecake.colors.normalSector.hover,
					callback : function(sector) {
						document.body.style.cursor = "pointer";
						cheesecake.grid.hideAll();
						cheesecake.grid.fadeIn(sector.actors, 300, true);
						sector.focus();
						if(cheesecake.highlightedSector != null){
							cheesecake.highlightedSector.fan(false, 
								function(){
									sector.fan(true);
								}
							);
						}else{
							sector.fan(true);
						}
						sector.getCheesecake().setHighlightedSector(sector);
					}
				},
				mouseout : {
					color : socialCheesecake.colors.normalSector.background,
					callback : function(sector) {
						document.body.style.cursor = "default";
						cheesecake.grid.hide(sector.actors);
						cheesecake.grid.fadeInAll(300, true);
						sector.unfocus();
						sector.getCheesecake().setHighlightedSector(null);
						sector.fan(false);
					}
				},
				click : {
					color : socialCheesecake.colors.normalSector.highlight,
					callback : function(sector) {
						cheesecake.focusAndBlurCheesecake(sector);
						cheesecake.grid.hideAll();
						cheesecake.grid.fadeIn(sector.actors,300, true);
					}
				},
				mouseup : { color : socialCheesecake.colors.normalSector.background },
				fontColor : socialCheesecake.colors.normalSector.font,
				borderColor : socialCheesecake.colors.normalSector.border
			};
			cheesecake.sectors[i] = new socialCheesecake.Sector(settings);
		}
		cheesecake.calculatePortions();
		cheesecake._setInitialState();
		cheesecake.draw();
	}
	
	socialCheesecake.Cheesecake.prototype.draw = function(){
		var sectors = this.sectors;
		var mainLayer = this.stage.mainLayer;
		for (var sector in sectors){
			mainLayer.add(sectors[sector].getRegion());
		}
		this.stage.draw();
	}
	
	socialCheesecake.Cheesecake.prototype.disable = function(){
		var layers = this.stage.layers;
		for(var layer in layers){
			layers[layer].listen(false);
		}
	}
	
	socialCheesecake.Cheesecake.prototype.enable = function(){
		var layers = this.stage.layers;
		for(var layer in layers){
			layers[layer].listen(true);
		}
	}
	
	socialCheesecake.Cheesecake.prototype.focusAndBlurCheesecake = function(sector) {
		var cheesecake = this;
		var mainLayer = this.stage.mainLayer;
		var regions = mainLayer.getShapes();
		var sectorIndex;
		for(var i in cheesecake.sectors) {
			if(cheesecake.sectors[i] === sector) sectorIndex = i;
		}
		if(sectorIndex == null)
			throw "sector doesn't belong to this cheesecake"
		for(var i = (regions.length - 1); i >= 0; i--) {
			if(!regions[i].permanent) {
				mainLayer.remove(regions[i]);
			}
		}
		mainLayer.clear();
		this.setHighlightedSector(sector);
		
		//Add auxiliar sectors
		var greySettings = {
			parent : cheesecake,
			center : {
				x : cheesecake.center.x,
				y : cheesecake.center.y
			},
			phi : sector.phi + sector.delta,
			delta : 2 * Math.PI - sector.delta,
			rOut : cheesecake.rMax,
			mouseout : {
				color : socialCheesecake.colors.greySector.background,
				callback : function() {
					document.body.style.cursor = "default";
				}
			},
			click : { color : socialCheesecake.colors.greySector.highlight },
			mouseup : { color : socialCheesecake.colors.greySector.background },
			mouseover : {
				color : socialCheesecake.colors.greySector.hover,
				callback : function() {
					document.body.style.cursor = "pointer";
				}
			},
			color : socialCheesecake.colors.greySector.background,
			fontColor : socialCheesecake.colors.greySector.font,
			borderColor : socialCheesecake.colors.greySector.border,
			auxiliar : true
		};
		var dummySettings = {
			parent : cheesecake,
			center : {
				x : cheesecake.center.x,
				y : cheesecake.center.y
			},
			phi : sector.phi,
			delta : sector.delta,
			rOut : sector.rOut,
			label : sector.label,
			simulate : sectorIndex,
			mouseout : {
				callback : function() {
					document.body.style.cursor = "default";
				}
			},
			mouseover : {
				callback : function() {
					document.body.style.cursor = "pointer";
				}
			},
			auxiliar : true
		};
		var greySector = new socialCheesecake.Sector(greySettings);
		cheesecake.auxiliarSectors.push(greySector);
		var dummySector = new socialCheesecake.Sector(dummySettings)
		cheesecake.auxiliarSectors.push(dummySector);

		mainLayer.add(greySector.getRegion());
		mainLayer.add(dummySector.getRegion());

		//Animations
		var greyClickCallback = function() {
			greySector.label = "";
			cheesecake.unfocusAndUnblurCheesecake();
		}
		var greyResizeCallback = function() {
			greySector.click.callback = greyClickCallback;
			greySector.label = "GO BACK";
		}
		var greyRotateToCallback = function() {
			greySector.resizeDelta({
				delta : 3 * Math.PI / 2,
				anchor : "M",
				callback : greyResizeCallback
			});
		}
		var dummyResizeCallback = function() {
			dummySector.splitUp();
		}
		var dummyRotateToCallback = function() {
			dummySector.resizeDelta({
				anchor : "M",
				callback : dummyResizeCallback
			});
		}

		greySector.rotateTo({
			destination : 5*Math.PI / 4,
			callback : greyRotateToCallback,
			anchor : "M"
		});

		dummySector.rotateTo({
			destination : Math.PI / 4 ,
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
		for(var i = (regions.length - 1); i >= 0; i--) {
			if(!regions[i].permanent) {
				mainLayer.remove(regions[i]);
				cheesecake.auxiliarSectors.pop();
			}
		}
		mainLayer.clear();
		
		// Add the former sectors and actors
		cheesecake.draw();
		if(lastSector){
			lastSector.color = lastSector.originalAttr.color;
			lastSector.fan(false);
			lastSector.unfocus();
			this.setHighlightedSector(null);
		}
		cheesecake.grid.fadeInAll(300, true);
	}
	socialCheesecake.Cheesecake.prototype.unfocusAndUnblurCheesecake = function() {
		var cheesecake = this;
		var auxiliarSectors = this.auxiliarSectors;
		var sector;
		var sectorNewDelta;
		var sectorNewPhi;
		var greySector;

		//Localize the dummy and grey sectors
		for(var i in auxiliarSectors) {
			if(auxiliarSectors[i].simulate != null) {
				sector = auxiliarSectors[i];
			} else {
				greySector = auxiliarSectors[i];
			}
		}

		//Animate and go back to the general view
		sectorNewDelta = cheesecake.sectors[sector.simulate].delta;
		sectorNewPhi = cheesecake.sectors[sector.simulate].phi;
		sector.putTogether();
		sector.resizeDelta({
			anchor : "M",
			delta : sectorNewDelta,
			callback : function() {
				sector.rotateTo({
					destination : sectorNewPhi
				});
			}
		});
		greySector.resizeDelta({
			anchor : "M",
			delta : (2*Math.PI) - sectorNewDelta,
			callback : function() {
				greySector.rotateTo({
					destination : sectorNewPhi + sectorNewDelta,
					callback : function() {
						cheesecake.recoverCheesecake();
					}
				});
			}
		});
	}
	
	/**
	 * actorId 		- actor which changes one of its parents
	 */
	socialCheesecake.Cheesecake.prototype.updateActorMembership = function (actor){
		var changes = this._changes;
		var grid = this.grid;
		var changesInActors;
		var alreadyChanged = false;
		var actorId = actor.id;
		var actorParents = actor.getParentsIds();
		var actorName = actor.name;
		var actorExtraInfo = actor.extraInfo;
		var onChange = this.onChange;
		
		if(changes.actors != undefined){
			changesInActors = changes.actors
			for( var a in changesInActors){
				if(changesInActors[a].id == actorId){
					alreadyChanged = true;
					changesInActors[a].subsectors = actorParents;
				}
			}
			if(!alreadyChanged){
				changesInActors.push({
					id : actorId,
					subsectors : actorParents,
					name : actorName,
					extraInfo : actorExtraInfo,
					justAdded : false
				});
			}
		}else{
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
	
	socialCheesecake.Cheesecake.prototype.calculatePortions = function (){
		var sectors = this.sectors;
		var match = this.matchActorsNumber;
		var deltaExtra = Math.PI / 8;
		var minDeltaSector = Math.PI / 8;
		var phi = ((5 * Math.PI) / 4) - (deltaExtra / 2);
		var sectorActors = [];
		var sectorPortions = [];
		var totalSectors = sectors.length;
		var totalActors = 0;
		var totalAngle = 2*Math.PI;
		var unusedAngle;
		
		//Begin with the extra Sector, if it exists
		if (sectors[sectors.length-1].auxiliar){
			sectors[sectors.length-1].phi = phi;
			sectors[sectors.length-1].delta = deltaExtra;
			sectors[sectors.length-1].originalAttr.phi = sectors[sectors.length-1].phi;
			sectors[sectors.length-1].originalAttr.delta = sectors[sectors.length-1].delta;
			phi += deltaExtra;
			totalSectors = sectors.length -1;
			totalAngle -= deltaExtra;
		}
		if(!match){
			unusedAngle = 0;
		}else{
			unusedAngle = totalAngle - totalSectors * minDeltaSector
		}
		for(var i = 0; i < totalSectors; i++) {
			sectorActors[i] = sectors[i].actors.length;
			totalActors += sectorActors[i];
			sectorPortions[i] = minDeltaSector;
			if(!match) sectorPortions[i] = totalAngle / totalSectors;
		}
		for(var i = 0; i < totalSectors; i++) {
			if(totalActors!=0){
				sectorPortions[i] += (sectorActors[i] / totalActors) * unusedAngle;				
			}else{
				sectorPortions[i] = totalAngle / totalSectors;
			}
			sectors[i].phi = phi;
			sectors[i].delta = sectorPortions[i];
			sectors[i].originalAttr.phi = sectors[i].phi;
			sectors[i].originalAttr.delta = sectors[i].delta;
			phi += sectors[i].delta;
		}
	}
	
	socialCheesecake.Cheesecake.prototype.setHighlightedSector = function(sector){
		if(this.highlightedSector != sector){
			this.highlightedSector = sector;
			if(this.onSectorHighlight){
				this.onSectorHighlight(this);
			}
		}
	}
	
	socialCheesecake.Cheesecake.prototype.getSectorById = function(id){
		var sectors = this.sectors;
		var sector;
		for (var i in sectors){
			if (sectors[i].id == id){
				sector = sectors[i];
				break;
			}
		}
		return sector;
	}
	
	socialCheesecake.Cheesecake.prototype.getSubsectorById = function(id){
		var sectors = this.sectors;
		var subsectors;
		var subsector;
		for (var i in sectors){
			subsectors = sectors[i].subsectors;
			for (var j in subsectors){
				if (subsectors[j].id == id){
					subsector = subsectors[j];
					break;
				}
			}
		}
		return subsector;
	}
	
	socialCheesecake.Cheesecake.prototype.getChanges = function (){
		return this._changes;
	}
	
	socialCheesecake.Cheesecake.prototype.getInitialState = function (){
		return this._initialState;
	}
	
	socialCheesecake.Cheesecake.prototype._setInitialState = function (){
		var state = this._initialState;
		var actors = this.grid.actors;
		
		state.actors = [];
		for( var actor in actors ){
			state.actors.push({ 
				id: actors[actor].id ,
				subsectors : actors[actor].getParentsIds(),
				name : actors[actor].name,
				extraInfo : actors[actor].extraInfo
			})
		}		
	}
	
})();

