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
		cheesecake.auxiliarSectors = [];
		cheesecake.stage = new Kinetic.Stage(cheesecakeData.container.id, 
			cheesecakeData.container.width, cheesecakeData.container.height);
		cheesecake.grid = new socialCheesecake.Grid({
			parent : this,
			grid_id : cheesecakeData.grid.id,
			divIdPrefix : cheesecakeData.grid.divIdPrefix || "actor_"
		});

		var phi = 0;
		var delta = 2 * Math.PI / (jsonSectors.length + 1);
		var actors = [];
		var extraSectorAdded =false;
		for(var i = 0; i < jsonSectors.length; i++) {
			if((!extraSectorAdded)&&(phi >= Math.PI)){
				extraSectorAdded = true;
				var extraSector = new socialCheesecake.Sector({
					parent : cheesecake,
					center : {
						x : cheesecakeData.center.x,
						y : cheesecakeData.center.y
					},
					label: "+",
					phi : phi,
					delta : delta,
					rOut : cheesecakeData.rMax,
					color : "#D4E4EA",
					mouseover : {
						color : "#1FA0F7",
						callback : function(sector) {
							sector.focus();
						}
					},
					mouseout : {
						color : "#D4E4EA",
						callback : function(sector) {
							sector.unfocus();
						}
					},
					mouseup : {color : "#1FA0F7"},
					mousedown : {color : "#1FA0F7"},
					auxiliar : true
				});
				cheesecake.sectors[jsonSectors.length] = extraSector;
				cheesecake.stage.add(extraSector.getRegion());
				i--;
			}else{
				var settings = {
					parent : cheesecake,
					center : {
						x : cheesecakeData.center.x,
						y : cheesecakeData.center.y
					},
					label : jsonSectors[i].name,
					phi : phi,
					delta : delta,
					rOut : cheesecakeData.rMax,
					subsectors : jsonSectors[i].subsectors,
					mouseover : {
						color : "#aaffaa",
						callback : function(sector) {
							/* FIX FOR EXECUTING MOUSEOUT BEFORE MOUSEOVER */					
							for(var i in cheesecake.sectors){
								cheesecake.sectors[i].getRegion().removeEventListener("mouseout");
								if(cheesecake.sectors[i]!= sector){
								 cheesecake.sectors[i].unfocus();
								 cheesecake.sectors[i].changeColor(cheesecake.sectors[i].mouseout.color);
								}
							}
							sector.getRegion().addEventListener("mouseout", function() {
								sector.eventHandler('mouseout');
							});
							
							document.body.style.cursor = "pointer";
							cheesecake.grid.hideAll();
							cheesecake.grid.fadeIn(sector.actors, 300, true);
							sector.focus();				
						}
					},
					mouseout : {
						color : "#eeffee",
						callback : function(sector) {
							document.body.style.cursor = "default";
							cheesecake.grid.fadeInAll(300, true);
							sector.unfocus();
						}
					},
					mousedown : {
						color : "#77ff77",
						callback : function(sector) {
							cheesecake.focusAndBlurCheesecake(sector);
							cheesecake.grid.hideAll();
							cheesecake.grid.fadeIn(sector.actors,300, true);
						}
					},
					mouseup : { color : "#aaffaa" }
				};
				cheesecake.sectors[i] = new socialCheesecake.Sector(settings);
				cheesecake.stage.add(cheesecake.sectors[i].getRegion());			
			}
			phi += delta;
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
				color : "#f5f5f5",
				callback : function() {
					document.body.style.cursor = "default";
				}
			},
			mousedown : { color : "#f5f5f5" },
			mouseup : { color : "#f5f5f5" },
			mouseover : {
				color : "#f5f5f5",
				callback : function() {
					document.body.style.cursor = "pointer";
				}
			},
			color : "#f5f5f5",
			textAndStrokeColor : "#666",
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
			}
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
			greySector.resize({
				delta : 3 * Math.PI / 2,
				anchor : "M",
				callback : greyResizeCallback
			});
		}
		var dummyResizeCallback = function() {
			dummySector.splitUp();
		}
		var dummyRotateToCallback = function() {
			dummySector.resize({
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
			}
		}
		cheesecake.auxiliarSectors.pop();

		// Add the former sectors and actors
		for(var i in cheesecake.sectors) {
			cheesecake.stage.add(cheesecake.sectors[i].getRegion());
		}
		cheesecake.grid.fadeInAll(300, true);
	}
	socialCheesecake.Cheesecake.prototype.unfocusAndUnblurCheesecake = function() {
		var cheesecake = this;
		var auxiliarSectors = this.auxiliarSectors;
		var sector;
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
		sector.putTogether();
		sector.resize({
			anchor : "M",
			delta : sector.originalAttr.delta,
			callback : function() {
				sector.rotateTo({
					destination : sector.originalAttr.phi
				});
			}
		});
		greySector.resize({
			anchor : "M",
			delta : greySector.originalAttr.delta,
			callback : function() {
				greySector.rotateTo({
					destination : greySector.originalAttr.phi,
					callback : function() {
						cheesecake.recoverCheesecake();
					}
				});
			}
		});
	}
})();

