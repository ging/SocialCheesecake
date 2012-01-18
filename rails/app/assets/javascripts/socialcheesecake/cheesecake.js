var socialCheesecake = socialCheesecake || {};
(function() {
	//General variable settings (with dafault values)
	/*  Normal */
	var sectorFillColor = "#eeffee";					//normal, mouseout, mouseup states	
	var sectorFocusColor = "#77ff77";					//mousedown state	
	var sectorHoverColor = "#aaffaa";					//mouseover state
	var sectorTextAndStrokeColor = "#1F4A75";	//text and border color
	
	/* Extra */
	var extraSectorFillColor = "#e5e5e5";			//normal, mouseout, mouseup states for extra sectors
	var extraFocusColor = "#1FA0F7";					//mousedown state for extra sectors
	var extraHoverColor = "#D4E4EA";					//mouseover state for extra sectors
	var extraTextAndStrokeColor = "#1F4A75";	//text and border color for extra sectors
	
	/* Grey */
	var greySectorFillColor = "#f5f5f5";			//normal, mouseout, mouseup states for grey auxiliar sectors
	var greyFocusColor = "#f5f5f5";						//mousedown state for grey auxiliar sectors
	var greyHoverColor = "#f5f5f5";						//mouseover state for grey auxiliar sectors
	var greyTextAndStrokeColor = "#666";			//text and border color for grey auxilar sectors
	
	/* Number of actors to animate */
	var maxVisibleActors = 30;
	
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
		cheesecake.highlightedSectorCallback = cheesecakeData.highlightedSectorCallback || undefined;
		cheesecake.auxiliarSectors = [];
		cheesecake.stage = new Kinetic.Stage(cheesecakeData.container.id, 
			cheesecakeData.container.width, cheesecakeData.container.height);
		cheesecake.grid = new socialCheesecake.Grid({
			parent : this,
			grid_id : cheesecakeData.grid.id,
			divIdPrefix : cheesecakeData.grid.divIdPrefix || "actor_"
		});
		cheesecake.searchEngine = new socialCheesecake.SearchEngine({
			parent : this
		});
		cheesecake.matchActorsNumber = cheesecakeData.match || true;
		cheesecake.changes = {};
		cheesecake.onChange = function(cheesecake){};
		if(cheesecakeData.maxVisibleActors != undefined) 
			socialCheesecake.Cheesecake.setMaxVisibleActors(cheesecakeData.maxVisibleActors);
		if(cheesecakeData.onChange)
			cheesecake.onChange = cheesecakeData.onChange;
		
		var extraSector = new socialCheesecake.Sector({
			parent : cheesecake,
			center : {
				x : cheesecakeData.center.x,
				y : cheesecakeData.center.y
			},
			label: "+",
			rOut : cheesecakeData.rMax,
			color : socialCheesecake.Cheesecake.getExtraSectorFillColor(),
			mouseover : {
				color : socialCheesecake.Cheesecake.getExtraSectorHoverColor(),
				callback : function(sector) {
					sector.focus();
				}
			},
			mouseout : {
				color : socialCheesecake.Cheesecake.getExtraSectorFillColor(),
				callback : function(sector) {
					sector.unfocus();
				}
			},
			mouseup : {color : socialCheesecake.Cheesecake.getExtraSectorFillColor()},
			mousedown : {color : socialCheesecake.Cheesecake.getExtraSectorFocusColor()},
			auxiliar : true,
			textAndStrokeColor : socialCheesecake.Cheesecake.getExtraSectorTextAndStrokeColor()
		});
		cheesecake.sectors[jsonSectors.length] = extraSector;
		
		for(var i = 0; i < jsonSectors.length; i++) {			
			var settings = {
				parent : cheesecake,
				center : {
					x : cheesecakeData.center.x,
					y : cheesecakeData.center.y
				},
				label : jsonSectors[i].name,
				rOut : cheesecakeData.rMax,
				subsectors : jsonSectors[i].subsectors,
				mouseover : {
					color : socialCheesecake.Cheesecake.getSectorHoverColor(),
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
					color : socialCheesecake.Cheesecake.getSectorFillColor(),
					callback : function(sector) {
						document.body.style.cursor = "default";
						cheesecake.grid.hide(sector.actors);
						cheesecake.grid.fadeInAll(300, true);
						sector.unfocus();
						sector.getCheesecake().setHighlightedSector(null);
						sector.fan(false);
					}
				},
				mousedown : {
					color : socialCheesecake.Cheesecake.getSectorFocusColor(),
					callback : function(sector) {
						cheesecake.focusAndBlurCheesecake(sector);
						cheesecake.grid.hideAll();
						cheesecake.grid.fadeIn(sector.actors,300, true);
					}
				},
				mouseup : { color : socialCheesecake.Cheesecake.getSectorFillColor() },
				textAndStrokeColor : socialCheesecake.Cheesecake.getSectorTextAndStrokeColor()
			};
			cheesecake.sectors[i] = new socialCheesecake.Sector(settings);
		}
		cheesecake.calculatePortions();
		cheesecake.draw();
	}
	
	socialCheesecake.Cheesecake.prototype.draw = function(){
		var sectors = this.sectors;
		for (var sector in sectors){
			this.stage.add(sectors[sector].getRegion());
		}
	}
	
	socialCheesecake.Cheesecake.prototype.focusAndBlurCheesecake = function(sector) {
		var cheesecake = this;
		var regions = cheesecake.stage.getShapes();
		var sectorIndex;
		for(var i in cheesecake.sectors) {
			if(cheesecake.sectors[i] === sector) sectorIndex = i;
		}
		if(sectorIndex == null)
			throw "sector doesn't belong to this cheesecake"
		for(var i = (regions.length - 1); i >= 0; i--) {
			if(!regions[i].permanent) {
				cheesecake.stage.remove(regions[i]);
			}
		}
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
				color : socialCheesecake.Cheesecake.getGreySectorFillColor(),
				callback : function() {
					document.body.style.cursor = "default";
				}
			},
			mousedown : { color : socialCheesecake.Cheesecake.getGreySectorFocusColor() },
			mouseup : { color : socialCheesecake.Cheesecake.getGreySectorFillColor() },
			mouseover : {
				color : socialCheesecake.Cheesecake.getGreySectorHoverColor(),
				callback : function() {
					document.body.style.cursor = "pointer";
				}
			},
			color : socialCheesecake.Cheesecake.getGreySectorFillColor(),
			textAndStrokeColor : socialCheesecake.Cheesecake.getGreySectorTextAndStrokeColor(),
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

		cheesecake.stage.add(greySector.getRegion());
		cheesecake.stage.add(dummySector.getRegion());

		//Animations
		var greyMousedownCallback = function() {
			greySector.label = "";
			cheesecake.unfocusAndUnblurCheesecake();
			cheesecake.grid.showAll();
		}
		var greyResizeCallback = function() {
			greySector.mousedown.callback = greyMousedownCallback;
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
		var regions = cheesecake.stage.getShapes();
		//Delete the auxiliar sectors
		for(var i = (regions.length - 1); i >= 0; i--) {
			if(!regions[i].permanent) {
				cheesecake.stage.remove(regions[i]);
				cheesecake.auxiliarSectors.pop();
			}
		}
		cheesecake.stage.layers.actors.clear();
		
		// Add the former sectors and actors
		cheesecake.draw();
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
		this.setHighlightedSector(null);
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
	socialCheesecake.Cheesecake.prototype.updateActorMembership = function (actorId){
		var changes = this.changes;
		var grid = this.grid;
		var changesInActors;
		var alreadyChanged = false;
		var actorParents = grid.getActor(actorId).parents;
		var actorSubsectors = [];
		var onChange = this.onChange;
		
		for(var parent in actorParents){
			actorSubsectors.push(actorParents[parent].id);
		}
		
		if(changes.actors != undefined){
			changesInActors = changes.actors
			for( var actor in changesInActors){
				if(changesInActors[actor].id == actorId){
					alreadyChanged = true;
					changesInActors[actor].subsectors = actorSubsectors;
				}
			}
			if(!alreadyChanged){
				changesInActors.push({
					id : actorId,
					subsectors : actorSubsectors
				});
			}
		}else{
			changes.actors = [];
			changes.actors.push({
				id : actorId,
				subsectors : actorSubsectors
			});
		}
		//Execute onChange Callback
		onChange(this);
	}
	
	socialCheesecake.Cheesecake.prototype.calculatePortions = function (){
		var sectors = this.sectors;
		var match = this.matchActorsNumber;
		var deltaExtra = Math.PI / 8;
		var deltaSector;
		var minDeltaSector = Math.PI / 6;
		var phi = ((5 * Math.PI) / 4) - (deltaExtra / 2);
		var sectorActors;
		var totalActors = 0;
		var consideredActors = 0;
		var littleSectors = 0;
		var isLittle = [];
		
		sectors[sectors.length-1].phi = phi;
		sectors[sectors.length-1].delta = deltaExtra;
		sectors[sectors.length-1].originalAttr.phi = sectors[sectors.length-1].phi;
		sectors[sectors.length-1].originalAttr.delta = sectors[sectors.length-1].delta;
		phi += deltaExtra;
		
		if(this.grid.actors.length == 0) match =false;
		if(match){
			//Calculate total number of actors
			for (var i = 0; i < sectors.length -1; i++){
				totalActors += (sectors[i].actors.length);				
			}
			consideredActors = totalActors;
			//Calculate percentage of actors of each sector
			for (var i = 0; i < sectors.length -1; i++){
				sectorActors = sectors[i].actors.length;			
				if( sectorActors / totalActors <= 0.1){ 
					isLittle[i] = true;
					littleSectors++;
					consideredActors -= sectors[i].actors.length;
				}
			}
			//Assign width
			for (var i = 0; i < sectors.length -1; i++){
				if(isLittle[i]){
					deltaSector = minDeltaSector;
				}else{
					deltaSector = (sectors[i].actors.length / consideredActors)* 
						(2*Math.PI - deltaExtra - littleSectors*minDeltaSector);
				}
				sectors[i].phi = phi;
				sectors[i].delta = deltaSector;
				sectors[i].originalAttr.phi = sectors[i].phi;
				sectors[i].originalAttr.delta = sectors[i].delta;
				phi += deltaSector;
			}
		}else{
			deltaSector = (2 * Math.PI - deltaExtra) / (sectors.length-1);
			for (var i = 0; i < sectors.length -1; i++){
				sectors[i].phi = phi;
				sectors[i].delta = deltaSector;
				sectors[i].originalAttr.phi = sectors[i].phi;
				sectors[i].originalAttr.delta = sectors[i].delta;
				phi += deltaSector;
			}
		}
	}
	
	socialCheesecake.Cheesecake.prototype.setHighlightedSector = function(sector){
		if(this.highlightedSector != sector){
			this.highlightedSector = sector;
			if(this.highlightedSectorCallback){
				this.highlightedSectorCallback(this);
			}
		}
	}
	
	socialCheesecake.Cheesecake.prototype.getChanges = function (){
		return this.changes;
	}

	//Colors and text style settings
	/** Sector Normal Fill Color (also mouseout and mouseup) */
	socialCheesecake.Cheesecake.getSectorFillColor = function (){
		return sectorFillColor;
	}
	socialCheesecake.Cheesecake.setSectorFillColor = function (newColor){
		if(typeof newColor === "string") sectorFillColor = newColor;
	}
	/** Extra Sectors Normal Fill Color (also mouseout and mouseup) */
	socialCheesecake.Cheesecake.getExtraSectorFillColor = function (){
		return extraSectorFillColor;
	}
	socialCheesecake.Cheesecake.setExtraSectorFillColor = function (newColor){
		if(typeof newColor === "string") extraSectorFillColor = newColor;
	}
	/** Grey Sectors Normal Fill Color (also mouseout and mouseup) */
	socialCheesecake.Cheesecake.getGreySectorFillColor = function (){
		return greySectorFillColor;
	}
	socialCheesecake.Cheesecake.setGreySectorFillColor = function (newColor){
		if(typeof newColor === "string") greySectorFillColor = newColor;
	}
	/** Sector Focus Fill Color (mousedown) */
	socialCheesecake.Cheesecake.getSectorFocusColor = function (){
		return sectorFocusColor;
	}
	socialCheesecake.Cheesecake.setSectorFocusColor = function (newColor){
		if(typeof newColor === "string") sectorFocusColor = newColor;
	}
	/** Extra Sectors Focus Fill Color (mousedown) */
	socialCheesecake.Cheesecake.getExtraSectorFocusColor = function (){
		return extraFocusColor;
	}
	socialCheesecake.Cheesecake.setExtraSectorFocusColor = function (newColor){
		if(typeof newColor === "string") extraFocusColor = newColor;
	}
	/** Grey Sectors Focus Fill Color (mousedown) */
	socialCheesecake.Cheesecake.getGreySectorFocusColor = function (){
		return greyFocusColor;
	}
	socialCheesecake.Cheesecake.setGreySectorFocusColor = function (newColor){
		if(typeof newColor === "string") greyFocusColor = newColor;
	}
	/** Sector Hover Fill Color (mouseover) */
	socialCheesecake.Cheesecake.getSectorHoverColor = function (){
		return sectorHoverColor;
	}
	socialCheesecake.Cheesecake.setSectorHoverColor = function (newColor){
		if(typeof newColor === "string") sectorHoverColor = newColor;
	}
	/** Extra Sectors Hover Fill Color (mouseover) */
	socialCheesecake.Cheesecake.getExtraSectorHoverColor = function (){
		return extraHoverColor;
	}
	socialCheesecake.Cheesecake.setExtraSectorHoverColor = function (newColor){
		if(typeof newColor === "string") extraHoverColor = newColor;
	}
	/** Grey Sectors Hover Fill Color (mouseover) */
	socialCheesecake.Cheesecake.getGreySectorHoverColor = function (){
		return greyHoverColor;
	}
	socialCheesecake.Cheesecake.setGreySectorHoverColor = function (newColor){
		if(typeof newColor === "string") greyHoverColor = newColor;
	}
	/** Sector Text and Stroke Color */
	socialCheesecake.Cheesecake.getSectorTextAndStrokeColor = function (){
		return sectorTextAndStrokeColor;
	}
	socialCheesecake.Cheesecake.setSectorTextAndStrokeColor = function (newColor){
		if(typeof newColor === "string") sectorTextAndStrokeColor = newColor;
	}
	/** Extra Sectors Hover Fill Color (mouseover) */
	socialCheesecake.Cheesecake.getExtraSectorTextAndStrokeColor = function (){
		return extraTextAndStrokeColor;
	}
	socialCheesecake.Cheesecake.setExtraSectorTextAndStrokeColor = function (newColor){
		if(typeof newColor === "string") extraTextAndStrokeColor = newColor;
	}
	/** Grey Sectors Hover Fill Color (mouseover) */
	socialCheesecake.Cheesecake.getGreySectorTextAndStrokeColor = function (){
		return greyTextAndStrokeColor;
	}
	socialCheesecake.Cheesecake.setGreySectorTextAndStrokeColor = function (newColor){
		if(typeof newColor === "string") greyTextAndStrokeColor = newColor;
	}
	/** Number of actors to animate */
	socialCheesecake.Cheesecake.getMaxVisibleActors = function(){
		return maxVisibleActors;
	}
	socialCheesecake.Cheesecake.setMaxVisibleActors = function(number){
		if(typeof number === "number") maxVisibleActors = number;
	}
	
})();

